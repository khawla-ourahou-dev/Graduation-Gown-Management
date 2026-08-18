import { useEffect, useState } from 'react'

type Client = {
  id: number
  name: string
  phone?: string
  city?: string
}

type Branch = {
  id: number
  name: string
  city: string
}

type Clothing = {
  id: number
  name: string
  type: string
  size?: string
  color?: string
  price: string | number
  rental_price?: string | number
  status?: string
  branch_id?: number
}

type Order = {
  id: number
  reference: string
  client: Client
  branch: Branch
  type: string
  status: string
  delivery_date?: string
  return_date?: string
  total_amount: string | number
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [clothing, setClothing] = useState<Clothing[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [showNewOrder, setShowNewOrder] = useState(false)

  const [form, setForm] = useState({
    client_id: '',
    branch_id: '',
    type: 'rental',
    clothing_id: '',
    price: '',
    delivery_date: '',
    return_date: '',
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        'http://127.0.0.1:8000/api/orders'
      )

      if (!response.ok) {
        throw new Error('تعذر جلب الطلبات')
      }

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const fetchFormData = async () => {
    try {
      const [clientsResponse, branchesResponse, clothingResponse] =
        await Promise.all([
          fetch('http://127.0.0.1:8000/api/clients'),
          fetch('http://127.0.0.1:8000/api/branches'),
          fetch('http://127.0.0.1:8000/api/clothing'),
        ])

      if (!clientsResponse.ok || !branchesResponse.ok || !clothingResponse.ok) {
        throw new Error('تعذر جلب بيانات الطلب')
      }

      const clientsData = await clientsResponse.json()
      const branchesData = await branchesResponse.json()
      const clothingData = await clothingResponse.json()

      setClients(clientsData)
      setBranches(branchesData)
      setClothing(clothingData)
    } catch (error) {
      console.error(error)
      alert('تعذر تحميل بيانات الطلب')
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchFormData()
  }, [])

  const handleTypeChange = (type: string) => {
    setForm({
      ...form,
      type,
      price: '',
    })
  }

  const handleClothingChange = (clothingId: string) => {
    const selected = clothing.find(
      (item) => item.id === Number(clothingId)
    )

    if (!selected) {
      setForm({
        ...form,
        clothing_id: clothingId,
        price: '',
      })
      return
    }

    const price =
      form.type === 'rental'
        ? selected.rental_price ?? selected.price
        : selected.price

    setForm({
      ...form,
      clothing_id: clothingId,
      price: String(price),
    })
  }

  const handleSaveOrder = async () => {
    if (
      !form.client_id ||
      !form.branch_id ||
      !form.clothing_id ||
      !form.price
    ) {
      alert('المرجو ملء جميع المعلومات المطلوبة')
      return
    }

    try {
      setSaving(true)

      const reference = `ORD-${Date.now()}`

      const totalAmount = Number(form.price)

      const response = await fetch(
        'http://127.0.0.1:8000/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            reference,
            client_id: Number(form.client_id),
            branch_id: Number(form.branch_id),
            type: form.type,
            status: 'new',
            delivery_date: form.delivery_date || null,
            return_date: form.return_date || null,
            total_amount: totalAmount,
            paid_amount: 0,
            items: [
              {
                clothing_id: Number(form.clothing_id),
                price: Number(form.price),
              },
            ],
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        alert(
          data.message ||
          'تعذر حفظ الطلب. تأكدي من المعلومات المدخلة.'
        )
        return
      }

      alert('تم حفظ الطلب بنجاح ✅')

      setShowNewOrder(false)

      setForm({
        client_id: '',
        branch_id: '',
        type: 'rental',
        clothing_id: '',
        price: '',
        delivery_date: '',
        return_date: '',
      })

      await fetchOrders()

    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const searchValue = search.toLowerCase()

    const clientName = order.client?.name || ''
    const clientPhone = order.client?.phone || ''
    const reference = order.reference || ''

    const matchesSearch =
      clientName.toLowerCase().includes(searchValue) ||
      clientPhone.toLowerCase().includes(searchValue) ||
      reference.toLowerCase().includes(searchValue)

    const matchesStatus =
      !statusFilter || order.status === statusFilter

    const matchesType =
      !typeFilter || order.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const totalOrders = orders.length

  const newOrders = orders.filter(
    (order) => order.status === 'new'
  ).length

  const reservedOrders = orders.filter(
    (order) => order.status === 'reserved'
  ).length

  const completedOrders = orders.filter(
    (order) => order.status === 'completed'
  ).length

  const cancelledOrders = orders.filter(
    (order) => order.status === 'cancelled'
  ).length

  const formatDate = (date?: string) => {
    if (!date) return '—'

    return new Date(date).toLocaleDateString('fr-FR')
  }

  const formatAmount = (amount: string | number) => {
    return `${Number(amount).toLocaleString('fr-FR')} DH`
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'جديد'
      case 'reserved':
        return 'محجوز'
      case 'completed':
        return 'مكتمل'
      case 'cancelled':
        return 'ملغى'
      default:
        return status
    }
  }

  const typeLabel = (type: string) => {
    return type === 'rental' ? 'كراء' : 'بيع'
  }

  return (
    <div className="orders-page">

      <div className="orders-header">
        <div>
          <h1>الطلبات</h1>
          <p>إدارة وتتبع جميع طلبات الكراء والبيع</p>
        </div>

        <button
          className="new-order"
          onClick={() => setShowNewOrder(true)}
        >
          ➕ طلب جديد
        </button>
      </div>

      {showNewOrder && (
        <div className="new-order-form">

          <h2>إضافة طلب جديد</h2>

          <div className="form-grid">

            <div>
              <label>الزبون *</label>

              <select
                value={form.client_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    client_id: e.target.value,
                  })
                }
              >
                <option value="">اختر الزبون</option>

                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.name}
                    {client.phone ? ` - ${client.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>الفرع *</label>

              <select
                value={form.branch_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    branch_id: e.target.value,
                  })
                }
              >
                <option value="">اختر الفرع</option>

                {branches.map((branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.name} - {branch.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>نوع العملية *</label>

              <select
                value={form.type}
                onChange={(e) =>
                  handleTypeChange(e.target.value)
                }
              >
                <option value="rental">كراء</option>
                <option value="sale">بيع</option>
              </select>
            </div>

            <div>
              <label>اللباس *</label>

              <select
                value={form.clothing_id}
                onChange={(e) =>
                  handleClothingChange(e.target.value)
                }
              >
                <option value="">اختر اللباس</option>

                {clothing
                  .filter(
                    (item) =>
                      item.status !== 'rented'
                  )
                  .map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                      {item.size
                        ? ` - ${item.size}`
                        : ''}
                      {item.color
                        ? ` - ${item.color}`
                        : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label>السعر *</label>

              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
                placeholder="السعر بالدرهم"
              />
            </div>

            <div>
              <label>تاريخ الاستلام</label>

              <input
                type="date"
                value={form.delivery_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    delivery_date: e.target.value,
                  })
                }
              />
            </div>

            {form.type === 'rental' && (
              <div>
                <label>تاريخ الإرجاع</label>

                <input
                  type="date"
                  value={form.return_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      return_date: e.target.value,
                    })
                  }
                />
              </div>
            )}

          </div>

          <div className="form-actions">

            <button
              type="button"
              onClick={() => setShowNewOrder(false)}
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={saving}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ الطلب'}
            </button>

          </div>

        </div>
      )}

      <div className="order-stats">

        <div className="order-stat">
          <span>جميع الطلبات</span>
          <strong>{totalOrders}</strong>
        </div>

        <div className="order-stat">
          <span>طلبات جديدة</span>
          <strong>{newOrders}</strong>
        </div>

        <div className="order-stat">
          <span>محجوزة</span>
          <strong>{reservedOrders}</strong>
        </div>

        <div className="order-stat">
          <span>مكتملة</span>
          <strong>{completedOrders}</strong>
        </div>

        <div className="order-stat">
          <span>ملغاة</span>
          <strong>{cancelledOrders}</strong>
        </div>

      </div>

      <div className="orders-tools">

        <input
          type="text"
          placeholder="🔍 البحث بالاسم أو الهاتف أو رقم الطلب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">جميع الحالات</option>
          <option value="new">جديد</option>
          <option value="reserved">محجوز</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغى</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
        >
          <option value="">جميع أنواع العمليات</option>
          <option value="rental">كراء</option>
          <option value="sale">بيع</option>
        </select>

      </div>

      <div className="orders-table-container">

        <table className="orders-table">

          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>الزبون</th>
              <th>المدينة</th>
              <th>الفرع</th>
              <th>النوع</th>
              <th>الاستلام</th>
              <th>الإرجاع</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={10}>
                  جاري تحميل الطلبات...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  لا توجد طلبات حالياً
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>

                  <td>
                    #{order.reference}
                  </td>

                  <td>
                    {order.client?.name || '—'}
                  </td>

                  <td>
                    {order.client?.city ||
                      order.branch?.city ||
                      '—'}
                  </td>

                  <td>
                    {order.branch?.name || '—'}
                  </td>

                  <td>
                    {typeLabel(order.type)}
                  </td>

                  <td>
                    {formatDate(
                      order.delivery_date
                    )}
                  </td>

                  <td>
                    {formatDate(
                      order.return_date
                    )}
                  </td>

                  <td>
                    {formatAmount(
                      order.total_amount
                    )}
                  </td>

                  <td>
                    <span
                      className={`status ${order.status}`}
                    >
                      {statusLabel(
                        order.status
                      )}
                    </span>
                  </td>

                  <td>
                    <button
                      className="view-order"
                      onClick={() =>
                        alert(
                          `الطلب: ${
                            order.reference
                          }\nالزبون: ${
                            order.client?.name ||
                            '—'
                          }\nالمبلغ: ${
                            formatAmount(
                              order.total_amount
                            )
                          }`
                        )
                      }
                    >
                      عرض
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

export default Orders