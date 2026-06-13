import { useEffect, useState } from 'react'

export default function ScreenWrap({ screenKey, children, className = '' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
    return () => cancelAnimationFrame(t)
  }, [screenKey])

  return (
    <div
      className={`screen-wrap ${visible ? 'screen-wrap--in' : ''} ${className}`.trim()}
      key={screenKey}
    >
      {children}
    </div>
  )
}
