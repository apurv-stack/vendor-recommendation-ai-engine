import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";

export default function VendorImportUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFileValidated(selected);
  };

  const setFileValidated = (selected) => {
    const name = selected.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) {
      setError("Only .csv and .xlsx files are allowed.");
      setFile(null);
      return;
    }
    setFile(selected);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFileValidated(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        "/vendors/import-file",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(response.data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-6 w-full">

      {/* DROP ZONE */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-12 min-h-[280px]
          flex flex-col items-center justify-center gap-3 transition-all
          ${dragOver
            ? "border-indigo-400 bg-indigo-50"
            : file
            ? "border-green-300 bg-green-50"
            : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          <>
            <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <FileText size={24} className="text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB — ready to import
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <UploadCloud size={24} className="text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700">
                Drop your file here or <span className="text-indigo-600">browse</span>
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Supports .csv and .xlsx — up to any size
              </p>
            </div>
          </>
        )}
      </div>

      {/* UPLOAD BUTTON */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`
          w-full py-3 rounded-2xl font-semibold text-sm transition-all
          flex items-center justify-center gap-2
          ${!file || loading
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
          }
        `}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <UploadCloud size={16} />
            Import Vendors
          </>
        )}
      </button>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
          <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Import Failed</p>
            <p className="text-red-600 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* SUCCESS RESULT */}
      {result && (
        <div className="rounded-2xl border border-slate-100 overflow-hidden">

          {/* SUMMARY BAR */}
          <div className="bg-green-50 border-b border-green-100 px-5 py-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <p className="font-semibold text-green-800">Import Complete</p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white">
            {[
              { label: "Total Rows", value: result.total, color: "text-slate-800" },
              { label: "Imported", value: result.imported, color: "text-green-600" },
              { label: "Failed", value: result.failed, color: result.failed > 0 ? "text-red-500" : "text-slate-400" },
            ].map((stat) => (
              <div key={stat.label} className="px-5 py-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ERROR LIST */}
          {result.errors?.length > 0 && (
            <div className="bg-white border-t border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={16} className="text-red-400" />
                <p className="text-sm font-semibold text-slate-700">
                  {result.errors.length} row{result.errors.length > 1 ? "s" : ""} skipped
                </p>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {result.errors.map((e, i) => (
                  <div key={i} className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    {e}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESET */}
          <div className="bg-slate-50 border-t border-slate-100 px-5 py-3">
            <button
              onClick={reset}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              Import another file →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}