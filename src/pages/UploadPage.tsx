import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Papa from 'papaparse';

interface ChecklistItem {
  section: string;
  label: string;
  item: string;
  weight: string;
}

export default function UploadPage() {
  const [checklistData, setChecklistData] = useState<ChecklistItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 1) {
            const rows = results.data.slice(1) as string[][];
            const parsedData: ChecklistItem[] = [];
            let currentSection = '';

            rows.forEach((row) => {
              const colA = (row[0] || '').trim();
              const colB = (row[1] || '').trim();
              const colC = (row[2] || '').trim();
              const colD = (row[3] || '').trim();

              // Section names that indicate a new section
              const sectionNames = ['Subjective', 'Objective', 'Assessment', 'Plan'];
              
              // If column A has a section name, update current section
              if (colA && sectionNames.includes(colA)) {
                currentSection = colA;
              } else if (colA && !colB) {
                // If column A has a value and column B is empty, it might be a section header
                // Check if it looks like a section name (capitalized word)
                const words = colA.split(' ');
                if (words.length === 1 && colA[0] === colA[0].toUpperCase()) {
                  currentSection = colA;
                } else if (words.length > 0 && words[0][0] === words[0][0].toUpperCase()) {
                  // Also handle multi-word section names if they start with capital
                  currentSection = colA;
                }
              }

              // If column B has a value, it's a checklist item or subsection label
              if (colB) {
                // Determine which section to use:
                // - If column A is a section name, use it (this handles format where section and label are on same row)
                // - Otherwise, use the current section (inherited from previous rows)
                const sectionToUse = (colA && sectionNames.includes(colA)) ? colA : currentSection;
                
                parsedData.push({
                  section: sectionToUse || '', // Fallback to empty string if no section found
                  label: colB,
                  item: colC,
                  weight: colD,
                });
              }
            });

            setChecklistData(parsedData);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  };

  const totalPoints = checklistData.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    return sum + weight;
  }, 0);

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          linear-gradient(180deg, #2B3F47 0%, #0F131F 100%),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
      }}
    >
      {/* Header */}
      <header className="border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 19, 31, 0.8)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-white">NoteSage Sapient AI</div>
          </div>
          <div className="text-slate-300 text-sm">facultytest1@gmail.com</div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside
          className="w-64 border-r border-slate-700/50 min-h-[calc(100vh-73px)]"
          style={{
            background: `
              linear-gradient(180deg, #2B3F47 0%, #0F131F 100%),
              repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          }}
        >
          <div className="p-6">
            <h2 className="text-slate-400 text-sm font-semibold uppercase mb-4">Navigation</h2>
            <nav className="space-y-2">
              <a href="#" className="block px-4 py-2 text-slate-300 hover:bg-white/5 rounded transition-colors">
                Dashboard
              </a>
              <Link
                to="/"
                className="block px-4 py-2 rounded font-medium text-slate-900 hover:opacity-90 transition"
                style={{ backgroundColor: '#3DD1A5' }}
              >
                Events
              </Link>
              <a href="#" className="block px-4 py-2 text-slate-300 hover:bg-white/5 rounded transition-colors">
                Review Submissions
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <div className="text-slate-400 text-sm">
              <span className="text-slate-300">Faculty</span>
              <span className="mx-2">/</span>
              <span className="font-medium" style={{ color: '#3DD1A5' }}>Events</span>
              <span className="mx-2">/</span>
              <span className="text-slate-300">Edit</span>
            </div>
          </div>

          {/* Back Button */}
          <button className="mb-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium">
            ← Back to Event List
          </button>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-6">Edit Event: test</h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              {/* Step 1 */}
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: '#4A5568', color: '#E2E8F0' }}
                >
                  1
                </div>
                <span className="ml-2 text-sm text-slate-400">Event Details</span>
              </div>
              
              {/* Connector Line 1 */}
              <div className="flex-1 h-0.5" style={{ backgroundColor: '#3DD1A5' }}></div>
              
              {/* Step 2 */}
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: '#4A5568', color: '#E2E8F0' }}
                >
                  2
                </div>
                <span className="ml-2 text-sm text-slate-400">Case</span>
              </div>
              
              {/* Connector Line 2 */}
              <div className="flex-1 h-0.5" style={{ backgroundColor: '#3DD1A5' }}></div>
              
              {/* Step 3 - Active */}
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: '#3DD1A5', color: '#0F131F' }}
                >
                  3
                </div>
                <span className="ml-2 text-sm font-medium" style={{ color: '#3DD1A5' }}>
                  Rubrics
                </span>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Checklist Items</h2>
            <div className="mb-4">
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-slate-700 file:text-white
                  hover:file:bg-slate-600
                  file:cursor-pointer
                  cursor-pointer
                  border border-slate-600 rounded
                  bg-slate-800/50 p-2"
              />
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Upload a .csv or .xlsx file containing sectioned checklist items and weightages.{' '}
              <a href="#" className="text-blue-400 underline">Quick Guide</a>
            </p>
            <button
              onClick={() => navigate('/generate')}
              className="px-6 py-2 rounded font-medium text-slate-900 hover:opacity-90 transition"
              style={{ backgroundColor: '#3DD1A5' }}
            >
              Generate Checklist
            </button>
          </div>

          {/* Table */}
          <div
            className="rounded-lg overflow-hidden mb-8"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(15, 19, 31, 0.6)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: 'rgba(74, 85, 104, 0.5)' }}>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-200"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      Section
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-200"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      Checklist Item Label
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-200"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      Checklist Item
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-200"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {checklistData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        No checklist items found.
                      </td>
                    </tr>
                  ) : (
                    checklistData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-white/5 transition-colors"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                      >
                        <td className="px-4 py-3 text-sm text-slate-300" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {item.section}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {item.label}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {item.item}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {item.weight}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-slate-300">
              Total Points: <span className="font-semibold text-white">{totalPoints.toFixed(0)}</span>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium">
                Previous
              </button>
              <button
                onClick={() => navigate('/generate')}
                className="px-6 py-2 rounded font-medium text-slate-900 hover:opacity-90 transition"
                style={{ backgroundColor: '#3DD1A5' }}
              >
                Finish
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
