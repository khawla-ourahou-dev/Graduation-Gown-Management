import { useEffect, useState } from 'react'
import './Stock.css'

interface Clothing {
  id: number
  name: string
  type: string
  size: string
  color: string
  unique_number: string
  status: string
  price: string | null
  rental_price: string | null
  branch_id: number | null
}

function Stock() {
  const [clothing, setClothing] = useState<Clothing[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')
  const [colorFilter, setColorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    type: '',
    size: '',
    color: '',
    unique_number: '',
    status: 'available',
    price: '',
    rental_price: '',
    branch_id: '1',
  })

  // جلب اللباس من Laravel
  const fetchClothing = () => {
    setLoading(true)

    fetch('https://graduation-gown-management.onrender.com/api/clothing')
      .then((response) => {
        if (!response.ok) {
          throw new Error('تعذر جلب المخزون')
        }

        return response.json()
      })
      .then((data) => {
        setClothing(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setError('تعذر الاتصال بالخادم')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchClothing()
  }, [])

  // تغيير بيانات الفورم
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value,
    })
  }

  // حفظ لباس جديد
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')

    if (
      !form.name ||
      !form.type ||
      !form.size ||
      !form.color ||
      !form.unique_number
    ) {
      setError('المرجو ملء جميع المعلومات الأساسية')
      return
    }

    setSaving(true)

    try {
      const url = editingId
  ? `https://graduation-gown-management.onrender.com/api/clothing/${editingId}`
  : 'https://graduation-gown-management.onrender.com/api/clothing'

const response = await fetch(url, {
  method: editingId ? 'PUT' : 'POST',

  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },

  body: JSON.stringify({
    name: form.name,
    type: form.type,
    size: form.size,
    color: form.color,
    unique_number: form.unique_number,
    status: form.status,
    price: form.price ? Number(form.price) : null,
    rental_price: form.rental_price
      ? Number(form.rental_price)
      : null,
    branch_id: Number(form.branch_id),
  }),
})
setShowForm(false)
setEditingId(null)
      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        throw new Error(
          data.message || 'حدث خطأ أثناء إضافة اللباس'
        )
      }

      // إضافة اللباس الجديد مباشرة للجدول
      setClothing((previous) => [...previous, data])

      // إغلاق الفورم
      setShowForm(false)

      // تفريغ الفورم
      setForm({
        name: '',
        type: '',
        size: '',
        color: '',
        unique_number: '',
        status: 'available',
        price: '',
        rental_price: '',
        branch_id: '1',
      })
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('حدث خطأ أثناء إضافة اللباس')
      }
    } finally {
      setSaving(false)
    }
  }

  // البحث والفلاتر
  const filteredClothing = clothing.filter((item) => {
    const searchValue = search.toLowerCase()

    const matchesSearch =
      item.name.toLowerCase().includes(searchValue) ||
      item.type.toLowerCase().includes(searchValue) ||
      item.unique_number.toLowerCase().includes(searchValue) ||
      item.color.toLowerCase().includes(searchValue)

    const matchesType =
      !typeFilter || item.type === typeFilter

    const matchesSize =
      !sizeFilter || item.size === sizeFilter

    const matchesColor =
      !colorFilter || item.color === colorFilter

    const matchesStatus =
      !statusFilter || item.status === statusFilter

    return (
      matchesSearch &&
      matchesType &&
      matchesSize &&
      matchesColor &&
      matchesStatus
    )
  })

  // الإحصائيات
  const available = clothing.filter(
    (item) => item.status === 'available'
  ).length

  const reserved = clothing.filter(
    (item) => item.status === 'reserved'
  ).length

  const rented = clothing.filter(
    (item) => item.status === 'rented'
  ).length

  const cleaning = clothing.filter(
    (item) => item.status === 'cleaning'
  ).length

  return (
    <div className="stock-page">

      {/* العنوان */}
      <div className="stock-header">
        <div>
          <h1>المخزون 👗</h1>
          <p>إدارة وتتبع ألبسة التخرج</p>
        </div>

        <button
          className="add-stock-btn"
          type="button"
          onClick={() => {
            setError('')
            setShowForm(true)
          }}
        >
          + إضافة لباس جديد
        </button>
      </div>

      {/* الإحصائيات */}
      <div className="stock-stats">

        <div className="stock-card">
          <span className="stock-icon">👗</span>
          <div>
            <p>اللباس المتوفر</p>
            <h2>{available}</h2>
          </div>
        </div>

        <div className="stock-card">
          <span className="stock-icon">📅</span>
          <div>
            <p>اللباس المحجوز</p>
            <h2>{reserved}</h2>
          </div>
        </div>

        <div className="stock-card">
          <span className="stock-icon">🧥</span>
          <div>
            <p>اللباس المكتري</p>
            <h2>{rented}</h2>
          </div>
        </div>

        <div className="stock-card">
          <span className="stock-icon">🧺</span>
          <div>
            <p>في التصبين</p>
            <h2>{cleaning}</h2>
          </div>
        </div>

      </div>

      {/* البحث والفلاتر */}
      <div className="stock-filters">

        <div className="search-box">
          🔎

          <input
            type="text"
            placeholder="البحث عن لباس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">كل الأنواع</option>
          <option value="روب تخرج">روب تخرج</option>
          <option value="قبعة">قبعة</option>
          <option value="إكسسوارات">إكسسوارات</option>
        </select>

        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
        >
          <option value="">كل المقاسات</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>

        <select
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
        >
          <option value="">كل الألوان</option>
          <option value="أسود">أسود</option>
          <option value="أزرق">أزرق</option>
          <option value="أحمر">أحمر</option>
          <option value="أبيض">أبيض</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">كل الحالات</option>
          <option value="available">متوفر</option>
          <option value="reserved">محجوز</option>
          <option value="rented">مكتري</option>
          <option value="cleaning">في التصبين</option>
        </select>

      </div>

      {/* فورم إضافة لباس */}
      {showForm && (
        <div className="stock-form">

<h2>
  {editingId ? 'تعديل اللباس 👗' : 'إضافة لباس جديد 👗'}
</h2>
          {error && (
            <p style={{ color: 'red' }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>

            <input
              name="name"
              type="text"
              placeholder="اسم اللباس"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="type"
              type="text"
              placeholder="النوع مثال: روب تخرج"
              value={form.type}
              onChange={handleChange}
            />

            <select
              name="size"
              value={form.size}
              onChange={handleChange}
            >
              <option value="">اختر المقاس</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>

            <input
              name="color"
              type="text"
              placeholder="اللون"
              value={form.color}
              onChange={handleChange}
            />

            <input
              name="unique_number"
              type="text"
              placeholder="الرقم الفريد مثال: GOWN-002"
              value={form.unique_number}
              onChange={handleChange}
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="available">متوفر</option>
              <option value="reserved">محجوز</option>
              <option value="rented">مكتري</option>
              <option value="cleaning">في التصبين</option>
            </select>

            <input
              name="price"
              type="number"
              placeholder="ثمن البيع"
              value={form.price}
              onChange={handleChange}
            />

            <input
              name="rental_price"
              type="number"
              placeholder="ثمن الكراء"
              value={form.rental_price}
              onChange={handleChange}
            />

            <div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setError('')
                }}
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={saving}
              >
{saving
  ? 'جاري الحفظ...'
  : editingId
    ? 'حفظ التعديل'
    : 'حفظ'}              </button>

            </div>

          </form>

        </div>
      )}

      {/* جدول المخزون */}
      <div className="stock-table-container">

        <table className="stock-table">

          <thead>
            <tr>
              <th>الرمز</th>
              <th>النوع</th>
              <th>المقاس</th>
              <th>اللون</th>
              <th>الحالة</th>
              <th>الثمن</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={7}>
                  جاري تحميل المخزون...
                </td>
              </tr>
            ) : filteredClothing.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  لا توجد ألبسة مطابقة للبحث
                </td>
              </tr>
            ) : (
              filteredClothing.map((item) => (
                <tr key={item.id}>

                  <td>
                    #{item.unique_number}
                  </td>

                  <td>
                    {item.type}
                  </td>

                  <td>
                    {item.size}
                  </td>

                  <td>
                    {item.color}
                  </td>

                  <td>
                    <span className={`status ${item.status}`}>
                      {item.status === 'available' && 'متوفر'}
                      {item.status === 'reserved' && 'محجوز'}
                      {item.status === 'rented' && 'مكتري'}
                      {item.status === 'cleaning' && 'في التصبين'}
                    </span>
                  </td>

                  <td>
                    {item.rental_price
                      ? `${item.rental_price} درهم`
                      : `${item.price ?? 0} درهم`}
                  </td>

                  <td>
                  <button
  className="action-btn"
  type="button"
  onClick={() => {
    setEditingId(item.id)

    setForm({
      name: item.name,
      type: item.type,
      size: item.size,
      color: item.color,
      unique_number: item.unique_number,
      status: item.status,
      price: item.price ?? '',
      rental_price: item.rental_price ?? '',
      branch_id: String(item.branch_id ?? 1),
    })

    setError('')
    setShowForm(true)
  }}
>
  تعديل
</button>
                  <button
  className="delete-btn"
  type="button"
  onClick={async () => {
    const confirmed = window.confirm(
      `واش متأكدة بغيتي تحيدي ${item.name} ؟`
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `https://graduation-gown-management.onrender.com/api/clothing/${item.id}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('فشل حذف اللباس')
      }

      // نحيدوه مباشرة من الجدول
      setClothing((previous) =>
        previous.filter((clothing) => clothing.id !== item.id)
      )

      alert('تم حذف اللباس بنجاح ✅')
    } catch (error) {
      console.error(error)
      alert('وقع خطأ أثناء حذف اللباس ❌')
    }
  }}
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

export default Stock