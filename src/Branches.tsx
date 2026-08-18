import { useEffect, useState } from 'react'
import './Branches.css'

type Branch = {
  id: number
  name: string
  city: string
  address?: string
  phone?: string
  is_active: boolean
}

function Branches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    is_active: true,
  })

  const API = 'https://graduation-gown-management.onrender.com/api/branches'

  const loadBranches = async () => {
    try {
      const response = await fetch(API)
      const data = await response.json()
      setBranches(data)
    } catch (error) {
      console.error('Erreur:', error)
      alert('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBranches()
  }, [])

  const addBranch = async () => {
    if (!form.name || !form.city) {
      alert('المرجو إدخال اسم الفرع والمدينة')
      return
    }

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const error = await response.json()
        console.log(error)
        alert('وقع خطأ أثناء إضافة الفرع')
        return
      }

      const newBranch = await response.json()

      setBranches([...branches, newBranch])

      setForm({
        name: '',
        city: '',
        address: '',
        phone: '',
        is_active: true,
      })

      setShowForm(false)
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    }
  }

  const deleteBranch = async (id: number) => {
    const confirmDelete = window.confirm('واش متأكدة بغيتي تحذفي هاد الفرع؟')

    if (!confirmDelete) return

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        setBranches(branches.filter(branch => branch.id !== id))
      } else {
        alert('وقع خطأ أثناء الحذف')
      }
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    }
  }

  const filteredBranches = branches.filter(branch =>
    `${branch.name} ${branch.city} ${branch.phone || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const totalBranches = branches.length
  const openBranches = branches.filter(branch => branch.is_active).length
  const closedBranches = branches.filter(branch => !branch.is_active).length

  return (
    <div className="branches-page">

      <div className="branches-header">
        <div>
          <h1>الفروع 🏢</h1>
          <p>إدارة فروع المؤسسة ومتابعة المخزون والعمليات</p>
        </div>

        <button
          className="add-branch-btn"
          onClick={() => setShowForm(true)}
        >
          + إضافة فرع جديد
        </button>
      </div>

      {/* الإحصائيات */}
      <div className="branches-stats">

        <div className="branch-card">
          <span className="branch-icon">🏢</span>
          <div>
            <p>إجمالي الفروع</p>
            <h2>{totalBranches}</h2>
          </div>
        </div>

        <div className="branch-card">
          <span className="branch-icon">🟢</span>
          <div>
            <p>الفروع المفتوحة</p>
            <h2>{openBranches}</h2>
          </div>
        </div>

        <div className="branch-card">
          <span className="branch-icon">🔴</span>
          <div>
            <p>الفروع المغلقة</p>
            <h2>{closedBranches}</h2>
          </div>
        </div>

        <div className="branch-card">
          <span className="branch-icon">👗</span>
          <div>
            <p>إجمالي المخزون</p>
            <h2>—</h2>
          </div>
        </div>

      </div>

      {/* البحث */}
      <div className="branches-search">
        🔎
        <input
          type="text"
          placeholder="البحث عن فرع..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* الفورم */}
      {showForm && (
        <div className="branch-form">

          <h2>إضافة فرع جديد</h2>

          <input
            type="text"
            placeholder="اسم الفرع"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="المدينة"
            value={form.city}
            onChange={(e) =>
              setForm({ ...form, city: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="العنوان"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="الهاتف"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <label>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_active: e.target.checked,
                })
              }
            />
            الفرع مفتوح
          </label>

          <div>
            <button onClick={addBranch}>
              حفظ الفرع
            </button>

            <button onClick={() => setShowForm(false)}>
              إلغاء
            </button>
          </div>

        </div>
      )}

      {/* جدول الفروع */}
      <div className="branches-table-container">

        <table className="branches-table">

          <thead>
            <tr>
              <th>اسم الفرع</th>
              <th>المدينة</th>
              <th>الهاتف</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={5}>
                  جاري تحميل الفروع...
                </td>
              </tr>
            ) : filteredBranches.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  لا توجد فروع حالياً
                </td>
              </tr>
            ) : (
              filteredBranches.map((branch) => (
                <tr key={branch.id}>

                  <td>
                    <strong>{branch.name}</strong>
                  </td>

                  <td>{branch.city}</td>

                  <td>{branch.phone || '—'}</td>

                  <td>
                    <span
                      className={`branch-status ${
                        branch.is_active ? 'open' : 'closed'
                      }`}
                    >
                      {branch.is_active ? 'مفتوح' : 'مغلق'}
                    </span>
                  </td>

                  <td>

                    <button
                      className="branch-view-btn"
                      onClick={() =>
                        alert(
                          `الفرع: ${branch.name}\nالمدينة: ${branch.city}\nالعنوان: ${branch.address || '—'}`
                        )
                      }
                    >
                      عرض
                    </button>

                    <button
                      className="branch-edit-btn"
                      onClick={() => deleteBranch(branch.id)}
                    >
                      حذف
                    </button>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Branches