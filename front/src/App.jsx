import ImageUpload from "./components/ImageUpload";
import logo from "./assets/dvk.jpg";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        
        {/* Header */}
        <header className="text-center mb-12">
          <img
            src={logo}
            alt="DVK Logo"
            className="h-20 mx-auto mb-6 rounded-lg shadow-lg"
          />
          
          <h1 className="text-5xl sm:text-6xl font-light mb-4 tracking-tight">
            Label Extractor
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
            Extract structured pharmaceutical information from labels 
          </p>
        </header>

        {/* Features Tags */}
        <div className="flex gap-3 justify-center flex-wrap mb-12">
          {["PDF Support", "Image Processing", "In-Memory", "Gemini Vision"].map((tag) => (
            <span
              key={tag}
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Main Component */}
        <ImageUpload />

        {/* Footer */}
        <footer className="text-center mt-16 text-slate-400 text-sm">
          <p>Powered by DVK pvt Ltd.</p>
        </footer>
        
      </div>
    </div>
  );
}

export default App;