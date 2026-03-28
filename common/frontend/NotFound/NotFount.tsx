"use client";
import Button from "../Button/Button";

const NotFound = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="mt-4 text-gray-600">{title} Not Found</p>
      <Button onClick={() => window.history.back()}>Go Back</Button>
    </div>
  </div>
);

export default NotFound;
