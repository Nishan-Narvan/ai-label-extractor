import { useState } from "react";

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- LOGIC UNCHANGED ----
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid image or PDF");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://ai-label-extractor-back.vercel.app/api/extract",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setResult(data.data);
    } catch (err) {
      setError(err.message || "Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

 return (
  <div className="w-full overflow-x-hidden">
    <div className="max-w-6xl mx-auto w-full px-4 py-8">

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-medium mb-6 text-amber-400">
            Upload Label
          </h2>

          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-300
              file:mr-4 file:py-2.5 file:px-5
              file:rounded-lg file:border-0
              file:bg-amber-400 file:text-black
              file:font-medium file:cursor-pointer
              hover:file:bg-amber-300 transition"
          />

          {preview && (
            <div className="mt-6">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-64 rounded-lg border border-white/10"
              />
            </div>
          )}

          {file && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex-1 bg-amber-400 text-black px-6 py-3 rounded-lg
                  font-medium hover:bg-amber-300 transition
                  disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Analyze Label"}
              </button>

              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-white/5
                  border border-white/10 hover:bg-white/10 transition"
              >
                Reset
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-400 text-sm">
              ❌ {error}
            </div>
          )}
        </div>

       
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 sm:p-8 overflow-x-auto">
          <h2 className="text-2xl font-medium mb-6 text-amber-400">
            Extracted Information
          </h2>

          {!result && !loading && (
            <p className="text-slate-400 text-center py-10">
              No data yet. Upload a label and analyze.
            </p>
          )}

          {loading && (
            <p className="text-slate-300 text-center py-10">
              Processing your label…
            </p>
          )}

          {result && (
            <div className="space-y-6 min-w-0">
              {result.medicines?.map((medicine, index) => (
                <div
                  key={index}
                  className="border border-white/10 rounded-xl p-6 bg-white/5 space-y-4"
                >
                  <div className="p-4 bg-amber-400/10 rounded-lg border border-amber-400/20">
                    <p className="text-xs text-amber-400 uppercase mb-1">
                      Medicine Name
                    </p>
                    <p className="text-xl font-bold break-words">
                      {medicine.medicine_name || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-slate-400 uppercase mb-1">
                        Strength
                      </p>
                      <p className="break-words">{medicine.strength || "—"}</p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-slate-400 uppercase mb-1">
                        Manufacturer
                      </p>
                      <p className="break-words">
                        {medicine.manufacturer || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-xs text-blue-400 uppercase mb-1">
                      Usage
                    </p>
                    <p className="break-words">{medicine.usage || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ImageUpload;
