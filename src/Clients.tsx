import { useEffect, useState } from 'react'
import './Clients.css'

type Client = {
  id: number
  name: string
  phone?: string
  city?: string
  type?: string
  orders_count?: number
}

function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    type: 'individual',
  })

  const fetchClients = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        'http://127.0.0.1:8000/api/clients'
      )

      if (!response.ok) {
        throw new Error('تعذر جلب الزبناء')
      }

      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const openAddForm = () => {
    setEditingClient(null)

    setForm({
      name: '',
      phone: '',
      city: '',
      type: 'individual',
    })

    setShowForm(true)
  }

  const openEditForm = (client: Client) => {
    setEditingClient(client)

    setForm({
      name: client.name || '',
      phone: client.phone || '',
      city: client.city || '',
      type: client.type || 'individual',
    })

    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('المرجو إدخال اسم الزبون')
      return
    }

    try {
      setSaving(true)

      const url = editingClient
        ? `http://127.0.0.1:8000/api/clients/${editingClient.id}`
        : 'http://127.0.0.1:8000/api/clients'

      const response = await fetch(url, {
        method: editingClient ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        alert(data.message || 'تعذر حفظ الزبون')
        return
      }

      alert(
        editingClient
          ? 'تم تعديل الزبون بنجاح ✅'
          : 'تمت إضافة الزبون بنجاح ✅'
      )

      setShowForm(false)
      setEditingClient(null)

      await fetchClients()
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client: Client) => {
    const confirmed = window.confirm(
      `واش متأكدة بغيتي تحذفي الزبون "${client.name}"؟`
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/clients/${client.id}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        alert(data.message || 'تعذر حذف الزبون')
        return
      }

      alert('تم حذف الزبون بنجاح ✅')

      await fetchClients()
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    }
  }

  const filteredClients = clients.filter((client) => {
    const value = search.toLowerCase()

    return (
      client.name.toLowerCase().includes(value) ||
      (client.phone || '').toLowerCase().includes(value) ||
      (client.city || '').toLowerCase().includes(value)
    )
  })

  const totalClients = clients.length

  const activeClients = clients.filter(
    (client) => (client.orders_count || 0) > 0
  ).length

  return (
    <div className="clients-page">

      <div className="clients-header">
        <div>
          <h1>الزبناء 👥</h1>
          <p>
            إدارة معلومات الزبناء ومتابعة الطلبات والحجوزات
          </p>
        </div>

        <button
          className="add-client-btn"
          onClick={openAddForm}
        >
          + إضافة زبون جديد
        </button>
      </div>

      {showForm && (
        <div className="client-form">

          <h2>
            {editingClient
              ? 'تعديل الزبون'
              : 'إضافة زبون جديد'}
          </h2>

          <div className="client-form-grid">

            <div>
              <label>اسم الزبون *</label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="مثال: محمد أمين"
              />
            </div>

            <div>
              <label>رقم الهاتف</label>

              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                placeholder="06XXXXXXXX"
              />
            </div>

            <div>
              <label>المدينة</label>

              <input
                type="text"
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
                placeholder="مثال: الدار البيضاء"
              />
            </div>

            <div>
              <label>نوع الزبون</label>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
              >
                <option value="individual">
                  فرد
                </option>

                <option value="group">
                  مجموعة
                </option>
              </select>
            </div>

          </div>

          <div className="client-form-actions">

            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingClient(null)
              }}
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>

          </div>

        </div>
      )}

      <div className="clients-stats">

        <div className="client-card">
          <span className="client-icon">👥</span>

          <div>
            <p>إجمالي الزبناء</p>
            <h2>{totalClients}</h2>
          </div>
        </div>

        <div className="client-card">
          <span className="client-icon">🟢</span>

          <div>
            <p>زبناء نشيطون</p>
            <h2>{activeClients}</h2>
          </div>
        </div>

        <div className="client-card">
          <span className="client-icon">📋</span>

          <div>
            <p>إجمالي الطلبات</p>
            <h2>
              {clients.reduce(
                (sum, client) =>
                  sum + (client.orders_count || 0),
                0
              )}
            </h2>
          </div>
        </div>

      </div>

      <div className="clients-filters">

        <div className="client-search">
          🔎

          <input
            type="text"
            placeholder="البحث عن زبون بالاسم أو الهاتف..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

      </div>

      <div className="clients-table-container">

        <table className="clients-table">

          <thead>
            <tr>
              <th>الزبون</th>
              <th>رقم الهاتف</th>
              <th>المدينة</th>
              <th>عدد الطلبات</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={6}>
                  جاري تحميل الزبناء...
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  لا يوجد زبناء
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {

                const isActive =
                  (client.orders_count || 0) > 0

                return (
                  <tr key={client.id}>

                    <td>
                      <strong>
                        {client.name}
                      </strong>
                    </td>

                    <td>
                      {client.phone || '—'}
                    </td>

                    <td>
                      {client.city || '—'}
                    </td>

                    <td>
                      {client.orders_count || 0}
                    </td>

                    <td>
                      <span
                        className={`client-status ${
                          isActive
                            ? 'active'
                            : 'inactive'
                        }`}
                      >
                        {isActive
                          ? 'نشيط'
                          : 'غير نشيط'}
                      </span>
                    </td>

                    <td>

                      <button
                        className="client-edit-btn"
                        onClick={() =>
                          openEditForm(client)
                        }
                      >
                        تعديل
                      </button>

                      <button
                        className="client-action-btn"
                        onClick={() =>
                          handleDelete(client)
                        }
                      >
                        حذف
                      </button>

                    </td>

                  </tr>
                )
              })
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Clients
