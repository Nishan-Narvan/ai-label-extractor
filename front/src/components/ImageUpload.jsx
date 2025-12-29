import { useState } from "react";

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid image (JPG, PNG, WebP) or PDF file");
      return;
    }

    // Validate file size (50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);

    // Generate preview for images only
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  // Handle upload and extraction
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      setError("");

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/extract`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Extraction failed");
      }

      setResult(data.data);
      console.log("✅ Extraction successful:", data);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8">
      {/* Upload Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-medium mb-6 text-amber-400">
          Upload Label
        </h2>

        {/* File Input */}
        <div className="mb-6">
          <label className="block mb-3 text-sm text-slate-300">
            Select Image or PDF (Max 50MB)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-300
              file:mr-4 file:py-2.5 file:px-5
              file:rounded-lg file:border-0
              file:bg-amber-400 file:text-black
              file:font-medium file:cursor-pointer
              hover:file:bg-amber-300 file:transition"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="mb-6">
            <p className="text-sm text-slate-400 mb-2">Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto max-h-64 rounded-lg border border-white/10"
            />
          </div>
        )}

        {/* File Info */}
        {file && (
          <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/10">
            <p className="text-sm text-slate-300">
              <span className="text-slate-400">File:</span> {file.name}
            </p>
            <p className="text-sm text-slate-300 mt-1">
              <span className="text-slate-400">Size:</span>{" "}
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <p className="text-sm text-slate-300 mt-1">
              <span className="text-slate-400">Type:</span> {file.type}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex-1 bg-amber-400 text-black px-6 py-3 rounded-lg 
              font-medium hover:bg-amber-300 transition 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze Label"
            )}
          </button>

          {file && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 
                border border-white/10 transition disabled:opacity-50"
            >
              Reset
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-medium mb-6 text-amber-400">
          Extracted Information
        </h2>

        {!result && !loading && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-slate-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-400">
              No data yet. Upload a label and click Analyze.
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent mb-4"></div>
            <p className="text-slate-300">Processing your label...</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Label Type Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  result.label_type === "multiple"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                {result.label_type === "multiple"
                  ? `📦 Multiple Medicines (${result.medicines?.length || 0})`
                  : "💊 Single Medicine"}
              </span>
            </div>

            {/* Loop through all medicines */}
            {result.medicines?.map((medicine, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-xl p-6 bg-white/5 space-y-4"
              >
                {/* Medicine Header */}
                {result.medicines.length > 1 && (
                  <div className="mb-4 pb-3 border-b border-white/10">
                    <h3 className="text-xl font-semibold text-amber-400">
                      Medicine #{index + 1}
                    </h3>
                  </div>
                )}

                {/* Medicine Name */}
                <div className="p-4 bg-amber-400/10 rounded-lg border border-amber-400/20">
                  <p className="text-xs text-amber-400 uppercase tracking-wide mb-1">
                    💊 Medicine Name
                  </p>
                  <p className="text-xl text-white font-bold">
                    {medicine.medicine_name || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Composition */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                      🧪 Composition
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {medicine.composition?.length > 0 ? (
                        medicine.composition.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-400/10 text-green-300 
                              rounded-full text-sm border border-green-400/20"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-400">—</p>
                      )}
                    </div>
                  </div>

                  {/* Strength */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      ⚡ Strength
                    </p>
                    <p className="text-white font-medium">
                      {medicine.strength || "—"}
                    </p>
                  </div>

                  {/* Form */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      📋 Dosage Form
                    </p>
                    <p className="text-white">{medicine.form || "—"}</p>
                  </div>

                  {/* Manufacturer */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      🏭 Manufacturer
                    </p>
                    <p className="text-white">{medicine.manufacturer || "—"}</p>
                  </div>

                  {/* Batch Number */}
                  {medicine.batch_number && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        🔢 Batch Number
                      </p>
                      <p className="text-white font-mono text-sm">
                        {medicine.batch_number}
                      </p>
                    </div>
                  )}

                  {/* Expiry Date */}
                  {medicine.expiry_date && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        📅 Expiry Date
                      </p>
                      <p className="text-white">{medicine.expiry_date}</p>
                    </div>
                  )}
                </div>

                {/* Usage - Full Width */}
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">
                    🎯 Usage / Indication
                  </p>
                  <p className="text-white">{medicine.usage || "—"}</p>
                </div>

                {/* Dosage */}
                {medicine.dosage && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      💉 Dosage Instructions
                    </p>
                    <p className="text-white">{medicine.dosage}</p>
                  </div>
                )}

                {/* Warnings */}
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <p className="text-xs text-red-400 uppercase tracking-wide mb-1">
                    ⚠️ Warnings & Precautions
                  </p>
                  <p className="text-red-200">{medicine.warnings || "—"}</p>
                </div>

                {/* Side Effects */}
                {medicine.side_effects && (
                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1">
                      🩺 Side Effects
                    </p>
                    <p className="text-yellow-200">{medicine.side_effects}</p>
                  </div>
                )}

                {/* Storage */}
                {medicine.storage && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      🌡️ Storage Conditions
                    </p>
                    <p className="text-white">{medicine.storage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;
