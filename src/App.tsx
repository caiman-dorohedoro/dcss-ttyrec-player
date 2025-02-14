import { useState } from 'react'
import './App.css'
import TtyrecPlayer from './components/TtyrecPlayer'
import FileUploader from './components/FileUploader'

const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">TTYRec Player</h1>
      
      {!selectedFile && <FileUploader onFileSelect={setSelectedFile} />}
      {selectedFile && (
        <>
          <TtyrecPlayer file={selectedFile} />
          <button
            onClick={() => setSelectedFile(null)}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Upload Another File
          </button>
        </>
      )}
    </div>
  );
};


export default App
