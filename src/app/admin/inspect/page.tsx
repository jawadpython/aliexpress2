'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

export default function InspectExcelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [sampleData, setSampleData] = useState<Record<string, unknown>[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.xlsx')) {
      toast.error('Please upload an Excel file (.xls or .xlsx)')
      return
    }

    setFile(selectedFile)
    inspectFile(selectedFile)
  }

  const inspectFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]

      if (jsonData.length === 0) {
        toast.error('No data found in the Excel file')
        return
      }

      const availableColumns = Object.keys(jsonData[0])
      setColumns(availableColumns)
      setSampleData(jsonData.slice(0, 3)) // First 3 rows

      toast.success(`Found ${availableColumns.length} columns and ${jsonData.length} rows`)
    } catch (error) {
      console.error('Error inspecting file:', error)
      toast.error('Failed to inspect file')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Excel File Inspector</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({file.size} bytes)
            </p>
          )}
        </div>

        {columns.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Available Columns ({columns.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {columns.map((column, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded text-sm font-mono">
                    {column}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Price Column Analysis</h2>
              <div className="space-y-2">
                {columns.filter(col => 
                  col.toLowerCase().includes('price') || 
                  col.toLowerCase().includes('cost') ||
                  col.toLowerCase().includes('amount')
                ).map((column, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <div className="font-semibold text-yellow-800">💰 {column}</div>
                    <div className="text-sm text-yellow-700">
                      Sample values: {
                        sampleData.map(row => row[column] || 'null').join(', ')
                      }
                    </div>
                  </div>
                ))}
                {columns.filter(col => 
                  col.toLowerCase().includes('price') || 
                  col.toLowerCase().includes('cost') ||
                  col.toLowerCase().includes('amount')
                ).length === 0 && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <div className="text-red-800">⚠️ No price-related columns found!</div>
                    <div className="text-sm text-red-700 mt-1">
                      Your Excel file might not have columns with "price", "cost", or "amount" in the name.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Sample Data (First 3 Rows)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column, index) => (
                        <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((column, colIndex) => (
                          <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {String(row[column] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
