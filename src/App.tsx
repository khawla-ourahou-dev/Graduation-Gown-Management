import { useEffect, useState } from 'react'
import './App.css'

import Orders from './Orders'
import Stock from './Stock'
import Clients from './Clients'
import Branches from './Branches'
import Finance from './Finance'
import Employees from './Employees'
import Reports from './Reports'
import Delivery from './Delivery'
import Settings from './Settings'

function App() {
  const [page, setPage] = useState('dashboard')

  const [stats, setStats] = useState({
    available: 0,
    reserved: 0,
    rented: 0,
    cleaning: 0,
  })

  useEffect(() => {
    fetch('https://graduation-gown-management.onrender.com/api/clothing')
      .then((response) => response.json())
      .then((data) => {
        const clothes = Array.isArray(data) ? data : []

        setStats({
          available: clothes.filter(
            (item: any) => item.status === 'available'
          ).length,

          reserved: clothes.filter(
            (item: any) => item.status === 'reserved'
          ).length,

          rented: clothes.filter(
            (item: any) => item.status === 'rented'
          ).length,

          cleaning: clothes.filter(
            (item: any) => item.status === 'cleaning'
          ).length,
        })
      })
      .catch((error) => {
        console.error('Dashboard error:', error)
      })
  }, [page])

  return (
    <div className="app" dir="rtl">

      <aside className="sidebar">

        <h2>🎓 لباس التخرج</h2>

        <nav>

          <a
            className={page === 'dashboard' ? 'active' : ''}
            onClick={() => setPage('dashboard')}
          >
            🏠 لوحة التحكم
          </a>

          <a
            className={page === 'orders' ? 'active' : ''}
            onClick={() => setPage('orders')}
          >
            📋 الطلبات
          </a>

          <a
            className={page === 'stock' ? 'active' : ''}
            onClick={() => setPage('stock')}
          >
            👗 اللباس
          </a>

          <a
            className={page === 'clients' ? 'active' : ''}
            onClick={() => setPage('clients')}
          >
            👥 الزبناء
          </a>

          <a
            className={page === 'branches' ? 'active' : ''}
            onClick={() => setPage('branches')}
          >
            🏢 الفروع
          </a>

          <a
            className={page === 'employees' ? 'active' : ''}
            onClick={() => setPage('employees')}
          >
            👩‍💼 الموظفون
          </a>

          <a
            className={page === 'finance' ? 'active' : ''}
            onClick={() => setPage('finance')}
          >
            💰 المالية
          </a>

          <a
            className={page === 'reports' ? 'active' : ''}
            onClick={() => setPage('reports')}
          >
            📊 التقارير
          </a>

          <a
            className={page === 'delivery' ? 'active' : ''}
            onClick={() => setPage('delivery')}
          >
            📦 التسليم والاستلام
          </a>

          <a
            className={page === 'settings' ? 'active' : ''}
            onClick={() => setPage('settings')}
          >
            ⚙️ الإعدادات
          </a>

        </nav>
      </aside>

      <main className="main-content">

        {page === 'dashboard' ? (

          <>
            <header className="header">

              <div>
                <h1>لوحة التحكم</h1>

                <p>
                  مرحبا بك في نظام إدارة كراء وبيع لباس التخرج
                </p>
              </div>

              <button
                className="new-order"
                onClick={() => setPage('orders')}
              >
                + طلب جديد
              </button>

            </header>

            <section className="cards">

              <div className="card">
                <span>اللباس المتوفر</span>
                <strong>{stats.available}</strong>
              </div>

              <div className="card">
                <span>اللباس المحجوز</span>
                <strong>{stats.reserved}</strong>
              </div>

              <div className="card">
                <span>اللباس المكتري</span>
                <strong>{stats.rented}</strong>
              </div>

              <div className="card">
                <span>في التصبين</span>
                <strong>{stats.cleaning}</strong>
              </div>

            </section>

            <section className="quick-actions">

              <h2>العمليات السريعة</h2>

              <div className="actions">

                <button onClick={() => setPage('orders')}>
                  ➕ طلب جديد للزبون
                </button>

                <button onClick={() => setPage('orders')}>
                  📅 مشاهدة الحجوزات
                </button>

                <button onClick={() => setPage('stock')}>
                  👗 المخزون
                </button>

                <button onClick={() => setPage('delivery')}>
                  📦 تسجيل عملية تسليم
                </button>

                <button onClick={() => setPage('delivery')}>
                  ↩️ تسجيل عملية إرجاع
                </button>

                <button onClick={() => setPage('finance')}>
                  💰 الصندوق ومصاريف الفرع
                </button>

              </div>

            </section>
          </>

        ) : page === 'orders' ? (
          <Orders />

        ) : page === 'stock' ? (
          <Stock />

        ) : page === 'clients' ? (
          <Clients />

        ) : page === 'branches' ? (
          <Branches />

        ) : page === 'employees' ? (
          <Employees />

        ) : page === 'finance' ? (
          <Finance />

        ) : page === 'reports' ? (
          <Reports />

        ) : page === 'delivery' ? (
          <Delivery />

        ) : page === 'settings' ? (
          <Settings />

        ) : null}

      </main>

    </div>
  )
}

export default App