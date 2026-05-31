import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Editor from "@/pages/Editor";
import { Toaster } from "@/components/ui/Toaster";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
