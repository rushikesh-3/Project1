import React from 'react'

function Loader() {
  return (
    <div className='flex justify-center items-center h-[80vh]'>
      <div className='animate-spin rounded-full h-14 w-14 border-4 border-grey-300 boder-t-primary'>

      </div>
    </div>
  )
}

export default Loader
