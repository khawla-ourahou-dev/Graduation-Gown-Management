import { useEffect, useState } from 'react'
import './assets/Finance.css'

type Payment = {
  id: number
  amount: number | string
  method: string
  payment_date?: string
  order?: {
    reference: string
  }
  branch?: {
    name: string
  }
}

type Expense = {
  id: number
  amount: number | string
  category: string
  description?: string
  expense_date?: string
  branch?: {
    name: string
  }
}

function Finance() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])

  const [showPayment, setShowPayment] = useState(false)
  const [showExpense, setShowExpense] = useState(false)

  const [paymentForm, setPaymentForm] = useState({
    order_id: '',
    branch_id: '',
    amount: '',
    method: 'cash',
    payment_date: '',
  })

  const [expenseForm, setExpenseForm] = useState({
    branch_id: '',
    amount: '',
    category: '',
    description: '',
    expense_date: '',
  })

  const loadData = async () => {
    try {
      const [
        paymentsRes,
        expensesRes,
        ordersRes,
        branchesRes,
      ] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/payments'),
        fetch('http://127.0.0.1:8000/api/expenses'),
        fetch('http://127.0.0.1:8000/api/orders'),
        fetch('http://127.0.0.1:8000/api/branches'),
      ])

      if (
        !paymentsRes.ok ||
        !expensesRes.ok ||
        !ordersRes.ok ||
        !branchesRes.ok
      ) {
        throw new Error()
      }

      setPayments(await paymentsRes.json())
      setExpenses(await expensesRes.json())
      setOrders(await ordersRes.json())
      setBranches(await branchesRes.json())
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const totalIncome = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  )

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  const balance = totalIncome - totalExpenses

  const formatMoney = (value: number) => {
    return value.toLocaleString('fr-FR') + ' DH'
  }

  const translateMethod = (method: string) => {
    switch (method) {
      case 'cash':
        return 'نقداً'
      case 'card':
        return 'بطاقة'
      case 'transfer':
        return 'تحويل'
      default:
        return method
    }
  }

  const savePayment = async () => {
    if (
      !paymentForm.order_id ||
      !paymentForm.branch_id ||
      !paymentForm.amount
    ) {
      alert('المرجو ملء المعلومات المطلوبة')
      return
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/payments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            order_id: Number(paymentForm.order_id),
            branch_id: Number(paymentForm.branch_id),
            amount: Number(paymentForm.amount),
            method: paymentForm.method,
            payment_date:
              paymentForm.payment_date || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        alert(data.message || 'تعذر حفظ الأداء')
        return
      }

      setShowPayment(false)

      setPaymentForm({
        order_id: '',
        branch_id: '',
        amount: '',
        method: 'cash',
        payment_date: '',
      })

      await loadData()

      alert('تم تسجيل الأداء بنجاح ✅')
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    }
  }

  const saveExpense = async () => {
    if (
      !expenseForm.branch_id ||
      !expenseForm.amount ||
      !expenseForm.category
    ) {
      alert('المرجو ملء المعلومات المطلوبة')
      return
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/expenses',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            branch_id: Number(expenseForm.branch_id),
            amount: Number(expenseForm.amount),
            category: expenseForm.category,
            description:
              expenseForm.description || null,
            expense_date:
              expenseForm.expense_date || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        alert(data.message || 'تعذر حفظ المصروف')
        return
      }

      setShowExpense(false)

      setExpenseForm({
        branch_id: '',
        amount: '',
        category: '',
        description: '',
        expense_date: '',
      })

      await loadData()

      alert('تم تسجيل المصروف بنجاح ✅')
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    }
  }

  return (
    <div className="finance-page">

      {/* HEADER */}
      <header className="finance-header">

        <div>
          <h1>💰 المالية</h1>
          <p>تتبع المداخيل والمصاريف والأداءات</p>
        </div>

        <div className="finance-header-actions">
          <button
            className="payment-btn"
            onClick={() => setShowPayment(true)}
          >
            + تسجيل أداء
          </button>

          <button
            className="expense-btn"
            onClick={() => setShowExpense(true)}
          >
            + إضافة مصروف
          </button>
        </div>

      </header>

      {/* STATISTICS */}
      <section className="finance-stats">

        <div className="finance-stat income">
          <div className="stat-icon">💵</div>

          <div>
            <span>إجمالي المداخيل</span>
            <strong>{formatMoney(totalIncome)}</strong>
          </div>
        </div>

        <div className="finance-stat expense">
          <div className="stat-icon">💸</div>

          <div>
            <span>إجمالي المصاريف</span>
            <strong>{formatMoney(totalExpenses)}</strong>
          </div>
        </div>

        <div className="finance-stat balance">
          <div className="stat-icon">💰</div>

          <div>
            <span>الرصيد</span>
            <strong>{formatMoney(balance)}</strong>
          </div>
        </div>

        <div className="finance-stat payments-count">
          <div className="stat-icon">🧾</div>

          <div>
            <span>عدد الأداءات</span>
            <strong>{payments.length}</strong>
          </div>
        </div>

      </section>

      {/* PAYMENT FORM */}
      {showPayment && (
        <section className="finance-form-card">

          <div className="form-title">
            <div>
              <h2>💳 تسجيل أداء جديد</h2>
              <p>أدخل معلومات الأداء المالي</p>
            </div>

            <button
              className="close-form"
              onClick={() => setShowPayment(false)}
            >
              ✕
            </button>
          </div>

          <div className="finance-form-grid">

            <div className="form-group">
              <label>الطلب</label>

              <select
                value={paymentForm.order_id}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    order_id: e.target.value,
                  })
                }
              >
                <option value="">اختاري الطلب</option>

                {orders.map((order) => (
                  <option
                    key={order.id}
                    value={order.id}
                  >
                    {order.reference} —{' '}
                    {order.client?.name || 'بدون اسم'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>الفرع</label>

              <select
                value={paymentForm.branch_id}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    branch_id: e.target.value,
                  })
                }
              >
                <option value="">اختاري الفرع</option>

                {branches.map((branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>المبلغ</label>

              <input
                type="number"
                placeholder="مثال: 500"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    amount: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>طريقة الأداء</label>

              <select
                value={paymentForm.method}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    method: e.target.value,
                  })
                }
              >
                <option value="cash">نقداً</option>
                <option value="card">بطاقة</option>
                <option value="transfer">تحويل بنكي</option>
              </select>
            </div>

            <div className="form-group">
              <label>تاريخ الأداء</label>

              <input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_date: e.target.value,
                  })
                }
              />
            </div>

          </div>

          <div className="form-actions">

            <button
              className="save-btn"
              onClick={savePayment}
            >
              ✓ حفظ الأداء
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowPayment(false)}
            >
              إلغاء
            </button>

          </div>

        </section>
      )}

      {/* EXPENSE FORM */}
      {showExpense && (
        <section className="finance-form-card">

          <div className="form-title">
            <div>
              <h2>💸 إضافة مصروف جديد</h2>
              <p>أدخل معلومات المصروف</p>
            </div>

            <button
              className="close-form"
              onClick={() => setShowExpense(false)}
            >
              ✕
            </button>
          </div>

          <div className="finance-form-grid">

            <div className="form-group">
              <label>الفرع</label>

              <select
                value={expenseForm.branch_id}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    branch_id: e.target.value,
                  })
                }
              >
                <option value="">اختاري الفرع</option>

                {branches.map((branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>المبلغ</label>

              <input
                type="number"
                placeholder="مثال: 300"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    amount: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>نوع المصروف</label>

              <select
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    category: e.target.value,
                  })
                }
              >
                <option value="">
                  اختاري نوع المصروف
                </option>

                <option value="شراء">شراء</option>
                <option value="صيانة">صيانة</option>
                <option value="نقل">نقل</option>
                <option value="أجور">أجور</option>
                <option value="كراء">كراء</option>
                <option value="ماء وكهرباء">
                  ماء وكهرباء
                </option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div className="form-group">
              <label>الوصف</label>

              <input
                type="text"
                placeholder="وصف المصروف..."
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>تاريخ المصروف</label>

              <input
                type="date"
                value={expenseForm.expense_date}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    expense_date: e.target.value,
                  })
                }
              />
            </div>

          </div>

          <div className="form-actions">

            <button
              className="save-btn"
              onClick={saveExpense}
            >
              ✓ حفظ المصروف
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowExpense(false)}
            >
              إلغاء
            </button>

          </div>

        </section>
      )}

      {/* PAYMENTS TABLE */}
      <section className="finance-section">

        <div className="section-header">
          <div>
            <h2>💳 آخر الأداءات</h2>
            <p>آخر العمليات المالية المسجلة</p>
          </div>
        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>الطلب</th>
                <th>الفرع</th>
                <th>المبلغ</th>
                <th>طريقة الأداء</th>
                <th>التاريخ</th>
              </tr>
            </thead>

            <tbody>

              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    لا توجد أداءات مسجلة
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>

                    <td className="reference">
                      {payment.order?.reference || '—'}
                    </td>

                    <td>
                      {payment.branch?.name || '—'}
                    </td>

                    <td className="amount-positive">
                      + {formatMoney(Number(payment.amount))}
                    </td>

                    <td>
                      <span className="method-badge">
                        {translateMethod(payment.method)}
                      </span>
                    </td>

                    <td>
                      {payment.payment_date
                        ? new Date(
                            payment.payment_date
                          ).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* EXPENSES TABLE */}
      <section className="finance-section">

        <div className="section-header">
          <div>
            <h2>💸 آخر المصاريف</h2>
            <p>آخر المصاريف المسجلة</p>
          </div>
        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>النوع</th>
                <th>الوصف</th>
                <th>المبلغ</th>
                <th>الفرع</th>
                <th>التاريخ</th>
              </tr>
            </thead>

            <tbody>

              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    لا توجد مصاريف مسجلة
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id}>

                    <td>
                      <span className="expense-category">
                        {expense.category}
                      </span>
                    </td>

                    <td>
                      {expense.description || '—'}
                    </td>

                    <td className="amount-negative">
                      - {formatMoney(Number(expense.amount))}
                    </td>

                    <td>
                      {expense.branch?.name || '—'}
                    </td>

                    <td>
                      {expense.expense_date
                        ? new Date(
                            expense.expense_date
                          ).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  )
}

export default Finance