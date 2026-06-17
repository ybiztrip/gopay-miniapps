import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TransactionHistory from "./pages/TransactionHistory";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transactions" element={<TransactionHistory />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
