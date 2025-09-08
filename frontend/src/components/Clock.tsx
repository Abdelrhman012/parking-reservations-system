import React, { useEffect, useState } from 'react'

const Clock = () => {
    const [now, setNow] = useState<string>("");

    useEffect(() => {
        const t = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(t);
    }, []);
  return (
      <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{now}</span>
      </div>
  )
}

export default Clock