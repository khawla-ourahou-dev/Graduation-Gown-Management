import { useState } from 'react'
import './Settings.css'

function Settings() {
  const [name, setName] = useState('لباس التخرج')
  const [phone, setPhone] = useState('06 00 00 00 00')
  const [email, setEmail] = useState('contact@example.com')
  const [address, setAddress] = useState('المغرب')

  const [language, setLanguage] = useState('العربية')
  const [notifications, setNotifications] = useState(true)
  const [message, setMessage] = useState('')

  const saveSettings = () => {
    localStorage.setItem(
      'graduation-settings',
      JSON.stringify({
        name,
        phone,
        email,
        address,
        language,
        notifications,
      })
    )

    setMessage('✅ تم حفظ الإعدادات بنجاح')

    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  return (
    <div className="settings-page">

      <header className="settings-header">
        <div>
          <h1>الإعدادات</h1>
          <p>إدارة إعدادات النظام والحساب</p>
        </div>
      </header>

      {message && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#e8f8ef',
            color: '#16834b',
            fontWeight: '600',
          }}
        >
          {message}
        </div>
      )}

      <div className="settings-grid">

        {/* معلومات المؤسسة */}
        <section className="settings-box">
          <h2>🏢 معلومات المؤسسة</h2>

          <div className="settings-form">

            <label>
              اسم المؤسسة
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label>
              رقم الهاتف
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            <label>
              البريد الإلكتروني
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              العنوان
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>

          </div>

          <button
            className="save-settings"
            onClick={saveSettings}
          >
            💾 حفظ التغييرات
          </button>
        </section>

        {/* إعدادات النظام */}
        <section className="settings-box">
          <h2>⚙️ إعدادات النظام</h2>

          <div className="setting-row">
            <div>
              <strong>اللغة</strong>
              <p>لغة واجهة النظام</p>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>العربية</option>
              <option>Français</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <strong>العملة</strong>
              <p>العملة المستخدمة في النظام</p>
            </div>

            <select defaultValue="dh">
              <option value="dh">الدرهم المغربي (DH)</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <strong>الإشعارات</strong>
              <p>استقبال إشعارات النظام</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <span></span>
            </label>
          </div>
        </section>

        {/* الحساب */}
        <section className="settings-box">
          <h2>👤 الحساب</h2>

          <div className="account-info">
            <div className="avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <p>مدير النظام</p>
            </div>
          </div>

          <button
            className="change-password"
            onClick={() => alert('🔒 تغيير كلمة المرور سيكون متاحاً لاحقاً')}
          >
            🔒 تغيير كلمة المرور
          </button>
        </section>

        {/* الصلاحيات */}
        <section className="settings-box">
          <h2>🔐 المستخدمون والصلاحيات</h2>

          <div className="permission-row">
            <span>مدير النظام</span>
            <strong>Admin</strong>
          </div>

          <div className="permission-row">
            <span>الموظفات</span>
            <strong>موظف</strong>
          </div>

          <p className="permission-note">
            يتم التحكم في الصلاحيات حسب دور المستخدم.
          </p>
        </section>

      </div>

    </div>
  )
}

export default Settings