import React from "react";
import "../NotFound.css";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(user);
      if (parsed.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <section className="page_404">
      <div className="container_404">
        <div className="four_zero_four_bg">
          <h1 className="text-center">404</h1>
        </div>
        <div className="contant_box_404">
          <h3 className="h2">Look like you're lost</h3>
          <p>The page you are looking for is not available!</p>
          <button className="link_404" onClick={handleGoHome}>Go to Home</button>
        </div>
      </div>
    </section>
  );
}