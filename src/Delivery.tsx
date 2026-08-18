import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import './assets/Delivery.css'

function Delivery() {
  const [type, setType] = useState<'delivery' | 'return'>('delivery')
  const [reference, setReference] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [scanning, setScanning] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)

  // البحث عن الطلب بواسطة رقم الطلب
  const searchOrderByReference = async (ref: string) => {
    if (!ref.trim()) {
      setMessage('⚠️ دخلي رقم الطلب أولاً')
      return
    }

    try {
      setMessage('جاري البحث...')

      const response = await fetch(
        `http://127.0.0.1:8000/api/orders?reference=${encodeURIComponent(
          ref.trim()
        )}`
      )

      if (!response.ok) {
        throw new Error('تعذر الاتصال بالخادم')
      }

      const data = await response.json()

      const found = Array.isArray(data)
        ? data.find(
            (item: any) =>
              item.reference?.toLowerCase() ===
              ref.trim().toLowerCase()
          )
        : data

      if (!found) {
        setOrder(null)
        setMessage('❌ الطلب غير موجود')
        return
      }

      setOrder(found)
      setMessage('✅ تم العثور على الطلب')
    } catch (error) {
      console.error('SEARCH ERROR:', error)
      setOrder(null)
      setMessage('❌ وقع خطأ أثناء البحث عن الطلب')
    }
  }

  // البحث اليدوي
  const searchOrder = async () => {
    await searchOrderByReference(reference)
  }

  // تشغيل QR Scanner
  const startScanner = async () => {
    try {
      setMessage('')
      setScanning(true)

      // نعطي الوقت للـ DOM باش ينشئ qr-reader
      await new Promise((resolve) => setTimeout(resolve, 100))

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      // الحصول على الكاميرات المتوفرة
      const cameras = await Html5Qrcode.getCameras()

      console.log('CAMERAS:', cameras)

      if (!cameras || cameras.length === 0) {
        throw new Error('NO_CAMERA')
      }

      // نفضل الكاميرا الخلفية
      const cameraId = cameras[cameras.length - 1].id

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1.777778,
        },
        async (decodedText) => {
          console.log('QR CODE:', decodedText)

          let qrReference = decodedText.trim()

          // إذا كان QR يحتوي على JSON
          try {
            const parsed = JSON.parse(qrReference)

            if (parsed.reference) {
              qrReference = String(parsed.reference)
            }
          } catch {
            // QR يحتوي على نص عادي
          }

          setReference(qrReference)

          // إيقاف الكاميرا
          await stopScanner()

          // البحث عن الطلب
          await searchOrderByReference(qrReference)
        },
        () => {
          // أخطاء القراءة العادية يتم تجاهلها
        }
      )

      console.log('QR SCANNER STARTED')
    } catch (error) {
      console.error('CAMERA ERROR:', error)

      setScanning(false)

      if (error instanceof Error && error.message === 'NO_CAMERA') {
        setMessage('❌ لم يتم العثور على كاميرا في هذا الجهاز.')
      } else {
        setMessage(
          '❌ تعذر تشغيل الكاميرا. تأكدي من السماح باستعمال الكاميرا.'
        )
      }
    }
  }

  // إيقاف QR Scanner
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch (error) {
        console.log('Scanner already stopped')
      }

      try {
        scannerRef.current.clear()
      } catch (error) {
        console.log('Scanner already cleared')
      }

      scannerRef.current = null
    }

    setScanning(false)
  }

  // تنظيف الكاميرا عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null
          })
      }
    }
  }, [])

  // تأكيد التسليم أو الاستلام
  const confirmOperation = async () => {
    if (!order) return

    const newStatus =
      type === 'delivery' ? 'rented' : 'completed'

    try {
      setMessage('جاري حفظ العملية...')

      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${order.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        console.error('UPDATE ERROR:', data)
        throw new Error('Failed')
      }

      setOrder(data)

      setMessage(
        type === 'delivery'
          ? '✅ تم تأكيد التسليم بنجاح'
          : '✅ تم تأكيد الاستلام بنجاح'
      )
    } catch (error) {
      console.error('CONFIRM ERROR:', error)
      setMessage('❌ تعذر حفظ العملية')
    }
  }

  // إلغاء العملية الحالية
  const cancelOperation = async () => {
    await stopScanner()

    setOrder(null)
    setReference('')
    setMessage('')
  }

  return (
    <div className="delivery-page">

      {/* Header */}
      <header className="delivery-header">
        <div>
          <h1>التسليم والاستلام</h1>

          <p>
            تسجيل عمليات تسليم واستلام لباس التخرج
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="delivery-tabs">

        <button
          className={`delivery-tab ${
            type === 'delivery' ? 'active' : ''
          }`}
          onClick={() => {
            setType('delivery')
            setOrder(null)
            setMessage('')
          }}
        >
          📦 التسليم
        </button>

        <button
          className={`delivery-tab ${
            type === 'return' ? 'active' : ''
          }`}
          onClick={() => {
            setType('return')
            setOrder(null)
            setMessage('')
          }}
        >
          ↩️ الاستلام
        </button>

      </div>

      {/* Search / QR */}
      <section className="qr-section">

        <div className="qr-content">

          <div className="qr-icon">
            ▦
          </div>

          <h2>
            {type === 'delivery'
              ? 'البحث عن طلب للتسليم'
              : 'البحث عن طلب للاستلام'}
          </h2>

          <p>
            امسح رمز QR أو أدخل رقم الطلب يدوياً
          </p>

          {/* QR Button */}
          {!scanning && (
            <button
              className="search-order"
              onClick={startScanner}
              style={{
                marginBottom: '15px',
              }}
            >
              📷 مسح QR Code
            </button>
          )}

          {/* QR Scanner */}
          {scanning && (
            <>
              <div
                id="qr-reader"
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  margin: '0 auto 15px',
                }}
              />

              <button
                className="cancel-delivery"
                onClick={stopScanner}
              >
                ⏹️ إيقاف الكاميرا
              </button>
            </>
          )}

          {/* Separator */}
          <div className="or-line">
            <span>أو أدخل رقم الطلب</span>
          </div>

          {/* Manual reference */}
          <input
            className="order-search"
            type="text"
            value={reference}
            onChange={(e) =>
              setReference(e.target.value)
            }
            placeholder="مثال: ORD-0001"
          />

          <button
            className="search-order"
            onClick={searchOrder}
          >
            🔎 البحث عن الطلب
          </button>

          {/* Message */}
          {message && (
            <p
              style={{
                marginTop: '15px',
              }}
            >
              {message}
            </p>
          )}

        </div>

      </section>

      {/* Order information */}
      {order && (
        <section className="delivery-order">

          <div className="delivery-order-header">

            <div>
              <h2>معلومات الطلب</h2>

              <p>
                الطلب رقم #{order.reference}
              </p>
            </div>

            <span className="delivery-status">
              {order.status}
            </span>

          </div>

          {/* Customer information */}
          <div className="customer-info">

            <div>
              <span>الزبون</span>

              <strong>
                {order.client?.name || 'غير محدد'}
              </strong>
            </div>

            <div>
              <span>الهاتف</span>

              <strong>
                {order.client?.phone || 'غير محدد'}
              </strong>
            </div>

            <div>
              <span>تاريخ التسليم</span>

              <strong>
                {order.delivery_date || 'غير محدد'}
              </strong>
            </div>

            <div>
              <span>تاريخ الاستلام</span>

              <strong>
                {order.return_date || 'غير محدد'}
              </strong>
            </div>

          </div>

          {/* Actions */}
          <div className="delivery-actions">

            <button
              className="confirm-delivery"
              onClick={confirmOperation}
            >
              {type === 'delivery'
                ? '✅ تأكيد التسليم'
                : '↩️ تأكيد الاستلام'}
            </button>

            <button
              className="cancel-delivery"
              onClick={cancelOperation}
            >
              إلغاء
            </button>

          </div>

        </section>
      )}

    </div>
  )
}

export default Delivery