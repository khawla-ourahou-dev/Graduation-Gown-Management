import { useEffect, useState } from 'react'
import './Reports.css'

function Reports() {
  const [orders, setOrders] = useState<any[]>([])
  const [clothing, setClothing] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const [
        ordersRes,
        clothingRes,
        paymentsRes,
        expensesRes,
        branchesRes
      ] = await Promise.all([
        fetch('https://graduation-gown-management.onrender.com/api/orders'),
        fetch('https://graduation-gown-management.onrender.com/api/clothing'),
        fetch('https://graduation-gown-management.onrender.com/api/payments'),
        fetch('https://graduation-gown-management.onrender.com/api/expenses'),
        fetch('https://graduation-gown-management.onrender.com/api/branches')
      ])

      setOrders(await ordersRes.json())
      setClothing(await clothingRes.json())
      setPayments(await paymentsRes.json())
      setExpenses(await expensesRes.json())
      setBranches(await branchesRes.json())
    } catch (error) {
      console.error('خطأ في تحميل التقارير:', error)
    }
  }

  const totalOrders = orders.length

  const rentalOrders = orders.filter(
    order => order.type === 'rental'
  ).length

  const totalIncome = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  )

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  )

  const profit = totalIncome - totalExpenses

  const newOrders = orders.filter(
    order => order.status === 'new'
  ).length

  const reservedOrders = orders.filter(
    order => order.status === 'reserved'
  ).length

  const completedOrders = orders.filter(
    order => order.status === 'completed'
  ).length

  const cancelledOrders = orders.filter(
    order => order.status === 'cancelled'
  ).length

  const availableClothing = clothing.filter(
    item => item.status === 'available'
  ).length

  const reservedClothing = clothing.filter(
    item => item.status === 'reserved'
  ).length

  const rentedClothing = clothing.filter(
    item => item.status === 'rented'
  ).length

  const cleaningClothing = clothing.filter(
    item => item.status === 'cleaning'
  ).length

  return (
    <div className="reports-page">

      <header className="reports-header">
        <div>
          <h1>التقارير</h1>
          <p>متابعة أداء النشاط والطلبات والمخزون والمالية</p>
        </div>

        <button
          className="export-report"
          onClick={() => window.print()}
        >
          📥 تصدير التقرير
        </button>
      </header>

      <section className="report-stats">

        <div className="report-card">
          <span>📦 مجموع الطلبات</span>
          <strong>{totalOrders}</strong>
          <small>إجمالي الطلبات</small>
        </div>

        <div className="report-card">
          <span>👗 عمليات الكراء</span>
          <strong>{rentalOrders}</strong>
          <small>طلبات الكراء</small>
        </div>

        <div className="report-card">
          <span>💰 المداخيل</span>
          <strong>{totalIncome.toLocaleString()} DH</strong>
          <small>إجمالي المداخيل</small>
        </div>

        <div className="report-card">
          <span>📈 الأرباح</span>
          <strong>{profit.toLocaleString()} DH</strong>
          <small>المداخيل - المصاريف</small>
        </div>

      </section>

      <section className="report-filters">

        <div>
          <label>الفترة</label>
          <select>
            <option>كل الفترات</option>
            <option>هذا الشهر</option>
            <option>الشهر الماضي</option>
            <option>آخر 3 أشهر</option>
            <option>هذه السنة</option>
          </select>
        </div>

        <div>
          <label>الفرع</label>

          <select>
            <option value="">جميع الفروع</option>

            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

      </section>

      <section className="reports-grid">

        <div className="report-box">
          <h2>📦 الطلبات حسب الحالة</h2>

          <div className="report-row">
            <span>طلبات جديدة</span>
            <strong>{newOrders}</strong>
          </div>

          <div className="report-row">
            <span>محجوزة</span>
            <strong>{reservedOrders}</strong>
          </div>

          <div className="report-row">
            <span>مكتملة</span>
            <strong>{completedOrders}</strong>
          </div>

          <div className="report-row">
            <span>ملغاة</span>
            <strong>{cancelledOrders}</strong>
          </div>
        </div>

        <div className="report-box">
          <h2>👗 حالة المخزون</h2>

          <div className="report-row">
            <span>متوفر</span>
            <strong>{availableClothing}</strong>
          </div>

          <div className="report-row">
            <span>محجوز</span>
            <strong>{reservedClothing}</strong>
          </div>

          <div className="report-row">
            <span>مكتري</span>
            <strong>{rentedClothing}</strong>
          </div>

          <div className="report-row">
            <span>في التصبين</span>
            <strong>{cleaningClothing}</strong>
          </div>
        </div>

        <div className="report-box">
          <h2>🏢 الفروع</h2>

          {branches.map(branch => {
            const branchOrders = orders.filter(
              order => Number(order.branch_id) === Number(branch.id)
            ).length

            return (
              <div className="report-row" key={branch.id}>
                <span>{branch.name}</span>
                <strong>{branchOrders} طلب</strong>
              </div>
            )
          })}
        </div>

        <div className="report-box">
          <h2>💰 الملخص المالي</h2>

          <div className="report-row">
            <span>المداخيل</span>
            <strong>{totalIncome.toLocaleString()} DH</strong>
          </div>

          <div className="report-row">
            <span>المصاريف</span>
            <strong>{totalExpenses.toLocaleString()} DH</strong>
          </div>

          <div className="report-row">
            <span>صافي الأرباح</span>
            <strong>{profit.toLocaleString()} DH</strong>
          </div>
        </div>

      </section>

    </div>
  )
}

export default Reports