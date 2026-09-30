/**
 * ==============================================================================
 * iCON ESPORTS - Oyuncu & Kadro Seçmeleri Form Yönetimi
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elementleri
    const form = document.getElementById('esportsApplyForm') || document.querySelector('form');
    const departmentSelect = document.getElementById('department');
    
    // Dinamik Kutular
    const valBox = document.getElementById('valDynamicBox');
    const lolBox = document.getElementById('lolDynamicBox');
    const cs2Box = document.getElementById('cs2DynamicBox');
    const mediaBox = document.getElementById('mediaDynamicBox');

    // Başarı Modalı
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // KVKK Modalı Elementleri
    const kvkkModal = document.getElementById('kvkkModal');
    const openKvkkModal = document.getElementById('openKvkkModal');
    const closeKvkkBtn = document.getElementById('closeKvkkBtn');
    const acceptKvkkModalBtn = document.getElementById('acceptKvkkModalBtn');
    const kvkkConsent = document.getElementById('kvkkConsent');

    // Google Sheets Webhook URL (iCON ESPORTS E-Tablosu)
    const GOOGLE_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbymp_1D0qvGbbrFrO_kkZGiXidhqQ8H8o53n36l81pEiM6_rRxxQp8p3mddNXrdTUWc/exec';

    // 1. Seviye / Rank Seçim Butonları (Görsel Seçim Efekti)
    const levelLabels = document.querySelectorAll('.level-option');
    levelLabels.forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', () => {
                const groupName = radio.name;
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
                    r.closest('.level-option')?.classList.remove('selected');
                });
                if (radio.checked) {
                    label.classList.add('selected');
                }
            });
        }
    });

    // 2. Dinamik Branş Kontrolü
    departmentSelect.addEventListener('change', () => {
        const val = departmentSelect.value;
        
        // Hepsini gizle
        valBox.classList.remove('active');
        lolBox.classList.remove('active');
        cs2Box.classList.remove('active');
        mediaBox.classList.remove('active');

        if (val.startsWith('Valorant')) {
            valBox.classList.add('active');
        } else if (val.startsWith('League of Legends')) {
            lolBox.classList.add('active');
        } else if (val.startsWith('Counter-Strike')) {
            cs2Box.classList.add('active');
        } else if (
            val.startsWith('Koçluk') || 
            val.startsWith('Yayın') || 
            val.startsWith('Sosyal Medya') || 
            val.startsWith('Turnuva')
        ) {
            mediaBox.classList.add('active');
        }
    });

    // Yardımcı: Seçilen Checkbox değerlerini dizi olarak al
    function getSelectedCheckboxes(selector) {
        const checked = document.querySelectorAll(`${selector}:checked`);
        return Array.from(checked).map(c => c.value);
    }

    // 3. Form Gönderimi
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const department = departmentSelect.value;
        if (!department) {
            alert('Lütfen başvurmak istediğiniz branş veya departmanı seçiniz.');
            return;
        }

        let rankStr = '-';
        let roleStr = '-';
        let profileLinkStr = '-';
        let mediaSkillsStr = '-';

        // Valorant Doğrulama
        if (department.startsWith('Valorant')) {
            const selectedRank = document.querySelector('input[name="val_rank"]:checked');
            if (!selectedRank) {
                alert('Lütfen Valorant rankınızı seçiniz.');
                return;
            }
            const roles = getSelectedCheckboxes('input[name="val_roles"]');
            if (roles.length === 0) {
                alert('Lütfen oynadığınız en az bir rol / ajan sınıfı seçiniz.');
                return;
            }
            const profile = document.getElementById('valProfile').value.trim();
            if (!profile) {
                alert('Lütfen Tracker.gg profil linkinizi veya Riot ID#TAG bilginizi giriniz.');
                document.getElementById('valProfile').focus();
                return;
            }
            rankStr = selectedRank.value;
            roleStr = roles.join(', ');
            profileLinkStr = profile;
        }

        // LoL Doğrulama
        else if (department.startsWith('League of Legends')) {
            const selectedRank = document.querySelector('input[name="lol_rank"]:checked');
            if (!selectedRank) {
                alert('Lütfen League of Legends rankınızı seçiniz.');
                return;
            }
            const roles = getSelectedCheckboxes('input[name="lol_roles"]');
            if (roles.length === 0) {
                alert('Lütfen oynadığınız en az bir ana koridor seçiniz.');
                return;
            }
            const profile = document.getElementById('lolProfile').value.trim();
            if (!profile) {
                alert('Lütfen OP.GG profil linkinizi veya sihirdar adınızı giriniz.');
                document.getElementById('lolProfile').focus();
                return;
            }
            rankStr = selectedRank.value;
            roleStr = roles.join(', ');
            profileLinkStr = profile;
        }

        // CS2 Doğrulama
        else if (department.startsWith('Counter-Strike')) {
            const cs2Rank = document.getElementById('cs2Rank').value.trim();
            const cs2Role = document.getElementById('cs2Role').value.trim();
            const cs2Profile = document.getElementById('cs2Profile').value.trim();
            if (!cs2Rank) {
                alert('Lütfen Premier puanınızı veya Faceit seviyenizi belirtiniz.');
                document.getElementById('cs2Rank').focus();
                return;
            }
            if (!cs2Role) {
                alert('Lütfen CS2 içerisindeki rolünüzü belirtiniz.');
                document.getElementById('cs2Role').focus();
                return;
            }
            rankStr = cs2Rank;
            roleStr = cs2Role;
            profileLinkStr = cs2Profile || '-';
        }

        // Medya & Yönetim
        else if (
            department.startsWith('Koçluk') || 
            department.startsWith('Yayın') || 
            department.startsWith('Sosyal Medya') || 
            department.startsWith('Turnuva')
        ) {
            const skills = getSelectedCheckboxes('input[name="media_skills"]');
            const portfolio = document.getElementById('mediaPortfolio').value.trim();
            mediaSkillsStr = skills.join(', ') || '-';
            profileLinkStr = portfolio || '-';
        }

        // KVKK Onay Kontrolü
        if (kvkkConsent && !kvkkConsent.checked) {
            alert('Lütfen devam etmek için KVKK Aydınlatma Metnini onaylayınız.');
            kvkkConsent.focus();
            return;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        const newApplicant = {
            id: 'ICON-' + Date.now().toString().slice(-5),
            date: dateStr,
            fullname: document.getElementById('fullname').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            university: document.getElementById('university').value.trim(),
            discord_tag: document.getElementById('discord_tag').value.trim(),
            department: department,
            rank_level: rankStr,
            roles: roleStr,
            profile_link: profileLinkStr,
            media_skills: mediaSkillsStr,
            experience: document.getElementById('experience').value.trim()
        };

        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> İLETİLİYOR...';

        try {
            await fetch(GOOGLE_SHEETS_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newApplicant)
            });

            // Formu sıfırla
            form.reset();
            valBox.classList.remove('active');
            lolBox.classList.remove('active');
            cs2Box.classList.remove('active');
            mediaBox.classList.remove('active');
            document.querySelectorAll('.level-option').forEach(l => l.classList.remove('selected'));

            successModal.classList.add('active');

        } catch (error) {
            alert('Bir hata oluştu, lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.');
            console.error('Gönderim hatası:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // 4. Başarı Modalı Kapatma
    closeModalBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
    });

    // 5. KVKK Modalı Dinleyicileri
    if (openKvkkModal) {
        openKvkkModal.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            kvkkModal.classList.add('active');
        });
    }

    if (closeKvkkBtn) {
        closeKvkkBtn.addEventListener('click', () => {
            kvkkModal.classList.remove('active');
        });
    }

    if (acceptKvkkModalBtn) {
        acceptKvkkModalBtn.addEventListener('click', () => {
            if (kvkkConsent) kvkkConsent.checked = true;
            kvkkModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.classList.remove('active');
        if (e.target === kvkkModal) kvkkModal.classList.remove('active');
    });
});
