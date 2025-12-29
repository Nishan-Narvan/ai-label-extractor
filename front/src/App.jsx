import ImageUpload from "./components/ImageUpload";
import logo from "./assets/dvk.jpg";

function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-black via-slate-900 to-black text-white">
      <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col">

        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <img
            src={logo}
            alt="DVK Logo"
            className="h-16 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-lg shadow-lg"
          />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light mb-3 sm:mb-4 tracking-tight">
            Label Extractor
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto font-light">
            Extract structured pharmaceutical information from labels using AI
          </p>
        </header>

        {/* Feature tags */}
        <div className="flex gap-2 sm:gap-3 justify-center flex-wrap mb-10">
          {["PDF Support", "Image Processing", "In-Memory", "Gemini Vision"].map(
            (tag) => (
              <span
                key={tag}
                className="bg-white/5 border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-slate-200"
              >
                {tag}
              </span>
            )
          )}
        </div>

        {/* Image Upload */}
        <ImageUpload />

        {/* Footer */}
        <footer className="mt-auto text-center text-slate-400 text-xs sm:text-sm mt-12">
          <p>Powered by DVK pvt ltd.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
