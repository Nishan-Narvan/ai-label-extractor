import { useState } from "react";

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError("Upload JPG, PNG, WebP, or PDF only");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File must be under 50MB");
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
      setError(err.message || "Something went wrong");
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
    /* FULL WIDTH SECTION */
    <section className="w-full py-8 sm:py-12">
      {/* CENTERED CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Upload Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 text-amber-400">
            Upload Label
          </h2>

          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="block w-full text-sm text-slate-300
              file:mr-4 file:py-2.5 file:px-5
              file:rounded-lg file:border-0
              file:bg-amber-400 file:text-black
              file:font-medium file:cursor-pointer
              hover:file:bg-amber-300 transition"
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-6 max-h-64 rounded-lg border border-white/10 mx-auto"
            />
          )}

          {file && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex-1 bg-amber-400 text-black py-3 rounded-lg
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
            <div className="mt-4 text-sm text-red-400">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Result Card */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 text-amber-400">
            Extracted Information
          </h2>

          {!result && !loading && (
            <p className="text-slate-400 text-center py-10">
              No data yet. Upload a label to begin.
            </p>
          )}

          {loading && (
            <p className="text-slate-300 text-center py-10">
              Processing...
            </p>
          )}

          {result && (
            <pre className="text-sm text-slate-200 overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>

      </div>
    </section>
  );
}

export default ImageUpload;
