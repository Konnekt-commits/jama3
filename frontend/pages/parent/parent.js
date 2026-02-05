import { openBottomSheet } from '../../components/bottomSheet/bottomSheet.js';
import { toastSuccess, toastError } from '../../components/toast/toast.js';
import router from '../../router/router.js';

let parentData = null;
let currentTab = 'children';

export async function renderParentPage() {
    const pageContent = document.getElementById('page-content');

    const sidebar = document.getElementById('sidebar');
    const navbar = document.getElementById('navbar');
    const mobileNav = document.getElementById('mobile-nav');
    if (sidebar) sidebar.style.display = 'none';
    if (navbar) navbar.style.display = 'none';
    if (mobileNav) mobileNav.style.display = 'none';

    const parentToken = localStorage.getItem('parent_token');
    if (!parentToken) {
        router.navigate('/login-parent');
        return;
    }

    pageContent.innerHTML = `
        <div style="min-height:100vh;background:#0D7377;display:flex;align-items:center;justify-content:center;">
            <div style="width:32px;height:32px;border:3px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;"></div>
        </div>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `;

    try {
        const response = await fetch('/api/school/parent-auth/me', {
            headers: { 'Authorization': `Bearer ${parentToken}` }
        });
        const result = await response.json();

        if (!result.success) {
            localStorage.removeItem('parent_token');
            localStorage.removeItem('parent_data');
            router.navigate('/login-parent');
            return;
        }

        parentData = result.data;
        renderApp(pageContent);
    } catch (error) {
        console.error('Error:', error);
        router.navigate('/login-parent');
    }
}

function renderApp(container) {
    const { parent, children, association, announcements, messages, unreadCount } = parentData;
    const initials = `${(parent.first_name || '')[0] || ''}${(parent.last_name || '')[0] || ''}`.toUpperCase();

    container.innerHTML = `
        <style>
            #page-content{padding:0 !important;}
            .app{min-height:100vh;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;}
            .app-header{background:linear-gradient(135deg,#064547 0%,#0D7377 100%);padding:0 0 16px;padding-top:env(safe-area-inset-top);flex-shrink:0;}
            .app-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;}
            .app-title{color:#fff;font-size:17px;font-weight:600;}
            .app-logout{background:none;border:none;color:rgba(255,255,255,0.8);padding:8px;cursor:pointer;}
            .app-user{display:flex;align-items:center;gap:12px;padding:0 16px 16px;}
            .app-avatar{width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;}
            .app-info{color:#fff;}
            .app-name{font-size:18px;font-weight:600;}
            .app-school{font-size:13px;opacity:0.8;}

            .app-tabs{display:flex;background:#fff;border-bottom:1px solid #E5E5E5;flex-shrink:0;}
            .app-tab{flex:1;padding:14px 0;text-align:center;font-size:14px;font-weight:500;color:#666;border:none;background:none;cursor:pointer;position:relative;}
            .app-tab.active{color:#0D7377;font-weight:600;}
            .app-tab.active::after{content:'';position:absolute;bottom:0;left:20%;right:20%;height:3px;background:#0D7377;border-radius:3px 3px 0 0;}
            .app-tab-badge{position:absolute;top:8px;right:calc(50% - 30px);background:#EF4444;color:#fff;font-size:10px;font-weight:600;padding:2px 6px;border-radius:10px;min-width:16px;}

            .app-content{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;}
            .app-section{display:none;}
            .app-section.active{display:block;}

            .list-header{display:flex;align-items:center;justify-content:space-between;padding:16px;background:#fff;border-bottom:1px solid #F0F0F0;}
            .list-title{font-size:15px;font-weight:600;color:#1A1A1A;}
            .list-count{font-size:13px;color:#999;}

            .child-item{display:flex;align-items:center;padding:16px;background:#fff;border-bottom:1px solid #F5F5F5;cursor:pointer;}
            .child-item:active{background:#F9F9F9;}
            .child-avatar{width:48px;height:48px;background:linear-gradient(135deg,#0D7377 0%,#095B5E 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:600;margin-right:14px;}
            .child-info{flex:1;}
            .child-name{font-size:16px;font-weight:600;color:#1A1A1A;margin-bottom:4px;}
            .child-meta{display:flex;gap:12px;font-size:13px;color:#666;}
            .child-meta .green{color:#10B981;}
            .child-meta .blue{color:#3B82F6;}
            .child-arrow{color:#CCC;}

            .announce-item{display:flex;align-items:center;padding:14px 16px;background:#fff;border-bottom:1px solid #F5F5F5;cursor:pointer;}
            .announce-item:active{background:#F9F9F9;}
            .announce-dot{width:8px;height:8px;background:#F59E0B;border-radius:50%;margin-right:12px;}
            .announce-text{flex:1;font-size:14px;color:#333;}
            .announce-date{font-size:12px;color:#999;margin-left:12px;}

            .msg-list{background:#fff;}
            .msg-item{padding:14px 16px;border-bottom:1px solid #F5F5F5;}
            .msg-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
            .msg-sender{font-size:13px;font-weight:600;color:#1A1A1A;}
            .msg-sender.teacher{color:#0D7377;}
            .msg-sender.parent{color:#666;}
            .msg-date{font-size:11px;color:#999;}
            .msg-student{font-size:11px;color:#999;margin-bottom:4px;}
            .msg-content{font-size:14px;color:#333;line-height:1.5;}
            .msg-unread{background:#F0FAF7;}

            .msg-compose{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E5E5E5;padding:12px 16px;padding-bottom:calc(env(safe-area-inset-bottom) + 12px);display:flex;gap:10px;}
            .msg-input{flex:1;border:1px solid #DDD;border-radius:20px;padding:10px 16px;font-size:14px;outline:none;}
            .msg-input:focus{border-color:#0D7377;}
            .msg-send{width:44px;height:44px;background:#0D7377;border:none;border-radius:50%;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;}
            .msg-send:disabled{background:#CCC;}

            .empty{padding:40px 20px;text-align:center;color:#999;font-size:14px;background:#fff;}
        </style>

        <div class="app">
            <div class="app-header">
                <div class="app-topbar">
                    <div class="app-title">Espace Parents</div>
                    <button class="app-logout" id="logoutBtn">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                    </button>
                </div>
                <div class="app-user">
                    <div class="app-avatar">${initials}</div>
                    <div class="app-info">
                        <div class="app-name">${esc(parent.first_name)} ${esc(parent.last_name)}</div>
                        <div class="app-school">${esc(association.name)}</div>
                    </div>
                </div>
            </div>

            <div class="app-tabs">
                <button class="app-tab active" data-tab="children">Enfants</button>
                <button class="app-tab" data-tab="messages">
                    Messages
                    ${unreadCount > 0 ? `<span class="app-tab-badge">${unreadCount}</span>` : ''}
                </button>
                <button class="app-tab" data-tab="announcements">Annonces</button>
            </div>

            <div class="app-content">
                <!-- Children Tab -->
                <div class="app-section active" id="section-children">
                    <div class="list-header">
                        <span class="list-title">Mes enfants</span>
                        <span class="list-count">${children.length}</span>
                    </div>
                    ${children.length > 0 ? children.map(child => {
                        const ci = `${(child.first_name||'')[0]||''}${(child.last_name||'')[0]||''}`.toUpperCase();
                        const att = child.attendance_rate || 0;
                        const avg = child.average_grade || '-';
                        return `
                            <div class="child-item" data-id="${child.id}">
                                <div class="child-avatar">${ci}</div>
                                <div class="child-info">
                                    <div class="child-name">${esc(child.first_name)} ${esc(child.last_name)}</div>
                                    <div class="child-meta">
                                        <span class="green">${att}% presence</span>
                                        <span class="blue">Moy: ${avg}</span>
                                    </div>
                                </div>
                                <div class="child-arrow">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </div>
                            </div>
                        `;
                    }).join('') : '<div class="empty">Aucun enfant inscrit</div>'}
                </div>

                <!-- Messages Tab -->
                <div class="app-section" id="section-messages">
                    <div class="msg-list" id="messagesList">
                        ${messages && messages.length > 0 ? messages.map(msg => `
                            <div class="msg-item ${!msg.is_read && msg.sender_type === 'teacher' ? 'msg-unread' : ''}">
                                <div class="msg-header">
                                    <span class="msg-sender ${msg.sender_type}">${msg.sender_type === 'teacher' ? 'Prof. ' : ''}${esc(msg.sender_name)}</span>
                                    <span class="msg-date">${formatDate(msg.created_at)}</span>
                                </div>
                                <div class="msg-student">Concernant: ${esc(msg.student_first_name)} ${esc(msg.student_last_name)}</div>
                                <div class="msg-content">${esc(msg.content)}</div>
                            </div>
                        `).join('') : '<div class="empty">Aucun message</div>'}
                    </div>
                    ${children.length > 0 ? `
                        <div class="msg-compose">
                            <select id="msgStudent" style="padding:10px;border:1px solid #DDD;border-radius:10px;font-size:14px;">
                                ${children.map(c => `<option value="${c.id}">${c.first_name}</option>`).join('')}
                            </select>
                            <input type="text" class="msg-input" id="msgInput" placeholder="Ecrire un message...">
                            <button class="msg-send" id="msgSend">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                            </button>
                        </div>
                    ` : ''}
                </div>

                <!-- Announcements Tab -->
                <div class="app-section" id="section-announcements">
                    <div class="list-header">
                        <span class="list-title">Annonces</span>
                        <span class="list-count">${announcements?.length || 0}</span>
                    </div>
                    ${announcements && announcements.length > 0 ? announcements.map(a => `
                        <div class="announce-item" data-id="${a.id}">
                            <div class="announce-dot"></div>
                            <div class="announce-text">${esc(a.title)}</div>
                            <div class="announce-date">${formatDate(a.created_at)}</div>
                        </div>
                    `).join('') : '<div class="empty">Aucune annonce</div>'}
                </div>
            </div>
        </div>
    `;

    // Tab switching
    document.querySelectorAll('.app-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`section-${tabName}`).classList.add('active');

            // Mark messages as read when opening messages tab
            if (tabName === 'messages' && unreadCount > 0) {
                markMessagesRead();
            }
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('parent_token');
        localStorage.removeItem('parent_data');
        toastSuccess('Deconnexion');
        router.navigate('/login-parent');
    });

    // Child items
    document.querySelectorAll('.child-item').forEach(el => {
        el.addEventListener('click', () => {
            const child = children.find(c => c.id === parseInt(el.dataset.id));
            if (child) openChildSheet(child);
        });
    });

    // Announcement items
    document.querySelectorAll('.announce-item').forEach(el => {
        el.addEventListener('click', () => {
            const ann = announcements?.find(a => a.id === parseInt(el.dataset.id));
            if (ann) openAnnounceSheet(ann);
        });
    });

    // Send message
    const msgSendBtn = document.getElementById('msgSend');
    const msgInput = document.getElementById('msgInput');
    if (msgSendBtn && msgInput) {
        msgSendBtn.addEventListener('click', sendMessage);
        msgInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

async function sendMessage() {
    const input = document.getElementById('msgInput');
    const studentSelect = document.getElementById('msgStudent');
    const content = input.value.trim();

    if (!content) return;

    const token = localStorage.getItem('parent_token');
    try {
        const res = await fetch('/api/school/parent-auth/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                student_id: parseInt(studentSelect.value),
                content
            })
        });

        const result = await res.json();
        if (result.success) {
            input.value = '';
            toastSuccess('Message envoye');
            // Reload to get updated messages
            setTimeout(() => location.reload(), 500);
        } else {
            toastError(result.message || 'Erreur');
        }
    } catch (err) {
        toastError('Erreur envoi message');
    }
}

async function markMessagesRead() {
    const token = localStorage.getItem('parent_token');
    try {
        await fetch('/api/school/parent-auth/mark-read', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Remove badge
        const badge = document.querySelector('.app-tab-badge');
        if (badge) badge.remove();
    } catch (err) {
        console.error('Mark read error:', err);
    }
}

function openChildSheet(child) {
    const ci = `${(child.first_name||'')[0]||''}${(child.last_name||'')[0]||''}`.toUpperCase();
    const classes = child.classes || [];
    const activity = child.recent_activity || [];
    const att = child.attendance_rate || 0;
    const avg = child.average_grade || '-';
    const pay = child.payment_status || 'pending';
    const pending = child.pending_amount || 0;
    const level = {debutant:'Debutant',intermediaire:'Intermediaire',avance:'Avance'}[child.level] || '-';

    const subjectIcons = {
        coran: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        arabe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>',
        fiqh: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
    };

    openBottomSheet({
        title: '',
        content: `
            <style>
                .child-detail{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}

                .cd-header{background:linear-gradient(135deg,#0D7377 0%,#095B5E 100%);padding:32px 20px;text-align:center;color:#fff;margin:-20px -20px 0 -20px;}
                .cd-avatar{width:80px;height:80px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;margin:0 auto 16px;border:3px solid rgba(255,255,255,0.3);}
                .cd-name{font-size:24px;font-weight:700;margin-bottom:8px;}
                .cd-level{display:inline-block;background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:20px;font-size:13px;font-weight:500;}

                .cd-stats{display:flex;margin:-30px 16px 0;position:relative;z-index:1;}
                .cd-stat{flex:1;background:#fff;text-align:center;padding:20px 10px;box-shadow:0 4px 12px rgba(0,0,0,0.1);}
                .cd-stat:first-child{border-radius:16px 0 0 16px;}
                .cd-stat:last-child{border-radius:0 16px 16px 0;}
                .cd-stat-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;}
                .cd-stat-icon.green{background:#ECFDF5;color:#10B981;}
                .cd-stat-icon.blue{background:#EFF6FF;color:#3B82F6;}
                .cd-stat-icon.purple{background:#F5F3FF;color:#8B5CF6;}
                .cd-stat-val{font-size:22px;font-weight:800;color:#1A1A1A;margin-bottom:4px;}
                .cd-stat-label{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;}

                .cd-body{padding:24px 16px;}

                .cd-section{margin-bottom:24px;}
                .cd-section:last-child{margin-bottom:0;}
                .cd-section-title{font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
                .cd-section-title svg{width:16px;height:16px;color:#0D7377;}

                .cd-classes{display:flex;flex-direction:column;gap:10px;}
                .cd-class{display:flex;align-items:center;gap:14px;padding:14px;background:#F8FAFA;border-radius:14px;border:1px solid #E8F0F0;}
                .cd-class-icon{width:44px;height:44px;background:linear-gradient(135deg,#0D7377,#095B5E);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
                .cd-class-info{flex:1;}
                .cd-class-name{font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:3px;}
                .cd-class-schedule{font-size:13px;color:#0D7377;font-weight:500;margin-bottom:3px;display:flex;align-items:center;gap:4px;}
                .cd-class-schedule svg{width:14px;height:14px;}
                .cd-class-teacher{font-size:12px;color:#666;display:flex;align-items:center;gap:4px;}
                .cd-class-teacher svg{width:12px;height:12px;}

                .cd-payment{background:linear-gradient(135deg,${pay==='paid'?'#ECFDF5,#D1FAE5':'#FFFBEB,#FEF3C7'});border-radius:16px;padding:20px;display:flex;align-items:center;justify-content:space-between;}
                .cd-payment-info{}
                .cd-payment-label{font-size:13px;color:#666;margin-bottom:4px;}
                .cd-payment-amount{font-size:28px;font-weight:800;color:${pay==='paid'?'#059669':'#D97706'};}
                .cd-payment-badge{background:${pay==='paid'?'#059669':'#D97706'};color:#fff;padding:10px 20px;border-radius:25px;font-size:14px;font-weight:600;}

                .cd-activity{display:flex;flex-direction:column;gap:8px;}
                .cd-activity-item{display:flex;align-items:center;gap:12px;padding:12px 14px;background:#F8F8F8;border-radius:12px;}
                .cd-activity-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
                .cd-activity-icon.present{background:#ECFDF5;color:#10B981;}
                .cd-activity-icon.absent{background:#FEF2F2;color:#EF4444;}
                .cd-activity-icon.grade{background:#EFF6FF;color:#3B82F6;}
                .cd-activity-content{flex:1;min-width:0;}
                .cd-activity-text{font-size:14px;color:#1A1A1A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
                .cd-activity-date{font-size:12px;color:#999;flex-shrink:0;}

                .cd-empty{text-align:center;padding:30px;color:#999;font-size:14px;}
            </style>
            <div class="child-detail">
                <div class="cd-header">
                    <div class="cd-avatar">${ci}</div>
                    <div class="cd-name">${esc(child.first_name)} ${esc(child.last_name)}</div>
                    <span class="cd-level">${level}</span>
                </div>

                <div class="cd-stats">
                    <div class="cd-stat">
                        <div class="cd-stat-icon green">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div class="cd-stat-val">${att}%</div>
                        <div class="cd-stat-label">Presence</div>
                    </div>
                    <div class="cd-stat">
                        <div class="cd-stat-icon blue">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                        </div>
                        <div class="cd-stat-val">${avg}</div>
                        <div class="cd-stat-label">Moyenne</div>
                    </div>
                    <div class="cd-stat">
                        <div class="cd-stat-icon purple">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        </div>
                        <div class="cd-stat-val">${classes.length}</div>
                        <div class="cd-stat-label">Classes</div>
                    </div>
                </div>

                <div class="cd-body">
                    <div class="cd-section">
                        <div class="cd-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            Classes inscrites
                        </div>
                        ${classes.length > 0 ? `<div class="cd-classes">${classes.map(c => {
                            const icon = subjectIcons[c.subject] || subjectIcons.coran;
                            const schedule = c.schedule ? `${c.schedule.day} ${c.schedule.start}-${c.schedule.end}` : '';
                            return `
                                <div class="cd-class">
                                    <div class="cd-class-icon">${icon}</div>
                                    <div class="cd-class-info">
                                        <div class="cd-class-name">${esc(c.name)}</div>
                                        ${schedule ? `<div class="cd-class-schedule"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${schedule}${c.room ? ' - ' + c.room : ''}</div>` : ''}
                                        ${c.teacher_name ? `<div class="cd-class-teacher"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${esc(c.teacher_name)}</div>` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}</div>` : '<div class="cd-empty">Aucune classe inscrite</div>'}
                    </div>

                    <div class="cd-section">
                        <div class="cd-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                            Paiement
                        </div>
                        <div class="cd-payment">
                            <div class="cd-payment-info">
                                <div class="cd-payment-label">${pay==='paid'?'Tout est paye':'Reste a payer'}</div>
                                <div class="cd-payment-amount">${pay==='paid'?'A jour':pending+' EUR'}</div>
                            </div>
                            <span class="cd-payment-badge">${pay==='paid'?'Paye':'En attente'}</span>
                        </div>
                    </div>

                    <div class="cd-section">
                        <div class="cd-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Activite recente
                        </div>
                        ${activity.length > 0 ? `<div class="cd-activity">${activity.slice(0,5).map(a => {
                            let ic = 'present', svg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
                            if (a.type === 'absence') { ic = 'absent'; svg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'; }
                            else if (a.type === 'grade') { ic = 'grade'; svg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M15 12.89L17 22l-5-3-5 3 2-9.11"/></svg>'; }
                            return `
                                <div class="cd-activity-item">
                                    <div class="cd-activity-icon ${ic}">${svg}</div>
                                    <div class="cd-activity-content">
                                        <div class="cd-activity-text">${esc(a.description)}</div>
                                    </div>
                                    <div class="cd-activity-date">${formatDate(a.date)}</div>
                                </div>
                            `;
                        }).join('')}</div>` : '<div class="cd-empty">Aucune activite recente</div>'}
                    </div>
                </div>
            </div>
        `
    });
}

function openAnnounceSheet(ann) {
    openBottomSheet({
        title: 'Annonce',
        content: `
            <div style="padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                <h2 style="font-size:17px;font-weight:700;color:#1A1A1A;margin:0 0 6px;">${esc(ann.title)}</h2>
                <p style="font-size:12px;color:#999;margin:0 0 16px;padding-bottom:16px;border-bottom:1px solid #EEE;">${formatDate(ann.created_at)}</p>
                <p style="font-size:14px;line-height:1.6;color:#333;margin:0;">${esc(ann.content || 'Aucun contenu')}</p>
            </div>
        `
    });
}

function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    if (diff < 7) return `${diff}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}
