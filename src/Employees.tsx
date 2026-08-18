import { useEffect, useState } from 'react'
import './Employees.css'

type Employee = {
  id: number
  name: string
  phone?: string
  role: string
  branch_id?: number | null
  branch?: {
    id: number
    name: string
  }
}

type Branch = {
  id: number
  name: string
}

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    role: '',
    branch_id: '',
  })

  const loadData = async () => {
    try {
      const [employeesRes, branchesRes] = await Promise.all([
        fetch('https://graduation-gown-management.onrender.com/api/employees'),
        fetch('https://graduation-gown-management.onrender.com/api/branches'),
      ])

      const employeesData = await employeesRes.json()
      const branchesData = await branchesRes.json()

      setEmployees(employeesData)
      setBranches(branchesData)
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openAdd = () => {
    setEditing(null)

    setForm({
      name: '',
      phone: '',
      role: '',
      branch_id: '',
    })

    setShowForm(true)
  }

  const openEdit = (employee: Employee) => {
    setEditing(employee)

    setForm({
      name: employee.name,
      phone: employee.phone || '',
      role: employee.role,
      branch_id: employee.branch_id
        ? String(employee.branch_id)
        : '',
    })

    setShowForm(true)
  }

  const saveEmployee = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      alert('الاسم والدور مطلوبان')
      return
    }

    try {
      const url = editing
        ? `https://graduation-gown-management.onrender.com/api/employees/${editing.id}`
        : 'https://graduation-gown-management.onrender.com/api/employees'

      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          role: form.role,
          branch_id: form.branch_id
            ? Number(form.branch_id)
            : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        alert(data.message || 'تعذر حفظ الموظف')
        return
      }

      setShowForm(false)
      setEditing(null)

      await loadData()

      alert('تم الحفظ بنجاح ✅')
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    }
  }

  const deleteEmployee = async (employee: Employee) => {
    if (!confirm(`حذف الموظف ${employee.name}؟`)) return

    try {
      const response = await fetch(
        `https://graduation-gown-management.onrender.com/api/employees/${employee.id}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        alert(data.message || 'تعذر الحذف')
        return
      }

      await loadData()
      alert('تم الحذف بنجاح ✅')
    } catch (error) {
      console.error(error)
      alert('تعذر الاتصال بالخادم')
    }
  }

  const filtered = employees.filter((employee) => {
    const value = search.toLowerCase()

    return (
      employee.name.toLowerCase().includes(value) ||
      (employee.phone || '').includes(value) ||
      employee.role.toLowerCase().includes(value) ||
      (employee.branch?.name || '')
        .toLowerCase()
        .includes(value)
    )
  })

  return (
    <div className="employees-page">

      <div className="employees-header">
        <div>
          <h1>الموظفون 👨‍💼</h1>
          <p>إدارة موظفي المؤسسة والفروع</p>
        </div>

        <button
          className="add-employee-btn"
          onClick={openAdd}
        >
          + إضافة موظف
        </button>
      </div>

      {showForm && (
        <div className="employee-form">

          <h2>
            {editing ? 'تعديل الموظف' : 'إضافة موظف جديد'}
          </h2>

          <input
            placeholder="اسم الموظف"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            placeholder="رقم الهاتف"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          <input
            placeholder="الدور"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          />

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
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          <button onClick={saveEmployee}>
            حفظ
          </button>

          <button
            onClick={() => setShowForm(false)}
          >
            إلغاء
          </button>

        </div>
      )}

      <div className="employees-filters">
        <input
          placeholder="🔎 البحث عن موظف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="employees-table-container">

        <table className="employees-table">

          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>الدور</th>
              <th>الفرع</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  لا يوجد موظفون حالياً
                </td>
              </tr>
            ) : (
              filtered.map((employee) => (
                <tr key={employee.id}>

                  <td>{employee.name}</td>

                  <td>
                    {employee.phone || '—'}
                  </td>

                  <td>{employee.role}</td>

                  <td>
                    {employee.branch?.name || '—'}
                  </td>

                  <td>

                    <button
                      onClick={() =>
                        openEdit(employee)
                      }
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() =>
                        deleteEmployee(employee)
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

export default Employees
