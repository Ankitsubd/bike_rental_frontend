import React, { useState } from 'react'
import { FaOptinMonster } from 'react-icons/fa';

const BikeFilters = ({onFilter}) => {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    
    const handleFilter = ()=> {
        onFilter({search, category});
    };
  return (
    <div className='flex flex-wrap gap-4 mb-6'>
        <input 
        type='text'
        placeholder='Search by Model or Brand...'
        value={search}
        onChange={(e)=> setSearch(e.target.value)}
        className='border px-4 py-2 rounded w-full md:w-full'
        />
        <select
        value={category}
        onChange={(e)=> setCategory(e.target.value)}
        className='border px-4 py-2 rounded w-full md:w-full'
        >
            <option value="">All Categories</option>
            <option value="Mountain">Mountain</option>
            <option value="City ride">City ride</option>
            <option value="Road">Road</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
            <option value="BMX">BMX</option>
        </select>

        <button 
        onClick={handleFilter}
        className='bg-blue-600 text-white px-6 py-2  rounded'
        >
            Apply
        </button>
    </div>
  )
}

export default BikeFilters