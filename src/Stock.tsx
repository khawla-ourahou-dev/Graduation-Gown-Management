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

const API = 'https://graduation-gown-management.onrender.com/api/clothing'

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

  const emptyForm = {
    name: '',
    type: '',
    size: '',
    color: '',
    unique_number: '',
    status: 'available',
    price: '',
    rental_price: '',
    branch_id: '1',
  }

  const [form, setForm] = useState(emptyForm)

  // =========================
  // جلب المخزون
  // =========================

  const fetchClothing = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API, {
        headers: {
          Accept: 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'تعذر جلب المخزون')
      }

      setClothing(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('تعذر الاتصال بالخادم')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClothing()
  }, [])

  // =========================
  // تغيير الفورم
  // =========================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // =========================
  // إضافة / تعديل لباس
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')

    if (
      !form.name.trim() ||
      !form.type.trim() ||
      !form.size.trim() ||
      !form.color.trim() ||
      !form.unique_number.trim()
    ) {
      setError('المرجو ملء جميع المعلومات الأساسية')
      return
    }

    try {
      setSaving(true)

      const url = editingId
        ? `${API}/${editingId}`
        : API

      const method = editingId ? 'PUT' : 'POST'

      const body = {
        name: form.name.trim(),
        type: form.type.trim(),
        size: form.size.trim(),
        color: form.color.trim(),
        unique_number: form.unique_number.trim(),
        status: form.status,
        price: form.price
          ? Number(form.price)
          : null,
        rental_price: form.rental_price
          ? Number(form.rental_price)
          : null,
        branch_id: form.branch_id
          ? Number(form.branch_id)
          : null,
      }

      console.log('Sending:', body)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      console.log('Laravel response:', data)

      if (!response.ok) {
        const validationErrors = data.errors
          ? Object.values(data.errors)
              .flat()
              .join('\n')
          : ''

        throw new Error(
          validationErrors ||
          data.message ||
          'حدث خطأ أثناء حفظ اللباس'
        )
      }

      // =========================
      // إذا كان تعديل
      // =========================

      if (editingId) {
        setClothing((previous) =>
          previous.map((item) =>
            item.id === editingId
              ? data
              : item
          )
        )

        alert('تم تعديل اللباس بنجاح ✅')
      }

      // =========================
      // إذا كان إضافة
      // =========================

      else {
        setClothing((previous) => [
          ...previous,
          data,
        ])

        alert('تمت إضافة اللباس بنجاح ✅')
      }

      // إعادة الفورم للوضع العادي
      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)

    } catch (error) {
      console.error('Save error:', error)

      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('حدث خطأ أثناء حفظ اللباس')
      }
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // تعديل لباس
  // =========================

  const handleEdit = (item: Clothing) => {
    setEditingId(item.id)

    setForm({
      name: item.name || '',
      type: item.type || '',
      size: item.size || '',
      color: item.color || '',
      unique_number: item.unique_number || '',
      status: item.status || 'available',
      price: item.price ?? '',
      rental_price: item.rental_price ?? '',
      branch_id: String(item.branch_id ?? 1),
    })

    setError('')
    setShowForm(true)
  }

  // =========================
  // حذف لباس
  // =========================

  const handleDelete = async (id: number, name: string) => {
    const confirmed = window.confirm(
      `واش متأكدة بغيتي تحيدي ${name} ؟`
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `${API}/${id}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'فشل حذف اللباس'
        )
      }

      setClothing((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      )

      alert('تم حذف اللباس بنجاح ✅')

    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('وقع خطأ أثناء حذف اللباس ❌')
      }
    }
  }

  // =========================
  // البحث والفلاتر
  // =========================

  const filteredClothing = clothing.filter((item) => {
    const searchValue = search.toLowerCase()

    const matchesSearch =
      item.name.toLowerCase().includes(searchValue) ||
      item.type.toLowerCase().includes(searchValue) ||
      item.unique_number.toLowerCase().includes(searchValue) ||
      item.color.toLowerCase().includes(searchValue)

    const matchesType =
      !typeFilter ||
      item.type === typeFilter

    const matchesSize =
      !sizeFilter ||
      item.size === sizeFilter

    const matchesColor =
      !colorFilter ||
      item.color === colorFilter

    const matchesStatus =
      !statusFilter ||
      item.status === statusFilter

    return (
      matchesSearch &&
      matchesType &&
      matchesSize &&
      matchesColor &&
      matchesStatus
    )
  })

  // =========================
  // الإحصائيات
  // =========================

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

  // =========================
  // فتح فورم الإضافة
  // =========================

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  // =========================
  // إغلاق الفورم
  // =========================

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

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
          onClick={openAddForm}
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
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
        >
          <option value="">كل الأنواع</option>
          <option value="روب تخرج">روب تخرج</option>
          <option value="قبعة">قبعة</option>
          <option value="إكسسوارات">إكسسوارات</option>
        </select>

        <select
          value={sizeFilter}
          onChange={(e) =>
            setSizeFilter(e.target.value)
          }
        >
          <option value="">كل المقاسات</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>

        <select
          value={colorFilter}
          onChange={(e) =>
            setColorFilter(e.target.value)
          }
        >
          <option value="">كل الألوان</option>
          <option value="أسود">أسود</option>
          <option value="أزرق">أزرق</option>
          <option value="أحمر">أحمر</option>
          <option value="أبيض">أبيض</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">كل الحالات</option>
          <option value="available">متوفر</option>
          <option value="reserved">محجوز</option>
          <option value="rented">مكتري</option>
          <option value="cleaning">في التصبين</option>
        </select>

      </div>

      {/* رسالة الخطأ */}

      {error && (
        <div
          style={{
            color: 'red',
            background: '#ffeaea',
            padding: '12px',
            margin: '15px 0',
            borderRadius: '8px',
            whiteSpace: 'pre-line',
          }}
        >
          {error}
        </div>
      )}

      {/* فورم إضافة / تعديل */}

      {showForm && (
        <div className="stock-form">

          <h2>
            {editingId
              ? 'تعديل اللباس 👗'
              : 'إضافة لباس جديد 👗'}
          </h2>

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
              <option value="">
                اختر المقاس
              </option>

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
              <option value="available">
                متوفر
              </option>

              <option value="reserved">
                محجوز
              </option>

              <option value="rented">
                مكتري
              </option>

              <option value="cleaning">
                في التصبين
              </option>
            </select>

            <input
              name="price"
              type="number"
              min="0"
              placeholder="ثمن البيع"
              value={form.price}
              onChange={handleChange}
            />

            <input
              name="rental_price"
              type="number"
              min="0"
              placeholder="ثمن الكراء"
              value={form.rental_price}
              onChange={handleChange}
            />

            <div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
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
                    : 'حفظ'}
              </button>

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

                    <span
                      className={`status ${item.status}`}
                    >
                      {item.status === 'available' &&
                        'متوفر'}

                      {item.status === 'reserved' &&
                        'محجوز'}

                      {item.status === 'rented' &&
                        'مكتري'}

                      {item.status === 'cleaning' &&
                        'في التصبين'}
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
                      onClick={() =>
                        handleEdit(item)
                      }
                    >
                      تعديل
                    </button>

                    <button
                      className="delete-btn"
                      type="button"
                      onClick={() =>
                        handleDelete(
                          item.id,
                          item.name
                        )
                      }
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