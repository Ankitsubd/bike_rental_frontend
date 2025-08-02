import React from 'react'

const Footer = () => {
  return (
    <>
        <div>
            <footer className='bottom-0 left-0 w-full bg-white mt-20 border-t py-4 text-center text-sm text-gray-500 shadow'>
                <p>© {new Date().getFullYear()} BikeRental. All rights reserved.</p>
                <p>Built as a BIT college project.</p>
            </footer>
        </div>
    </>
  )
}

export default Footer