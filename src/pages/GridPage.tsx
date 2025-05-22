
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const GridPage = () => {
  const handleSubmit = () => {
    console.log("Submitting answers");
    // This will be implemented later with validation logic
  };

  return (
    <div className="min-h-screen bg-[#f5f0e1] flex flex-col items-center px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-[#1d3557] mb-8 font-serif italic">Double-Play Grid</h1>
      
      <Card className="w-full max-w-3xl border-2 border-[#1d3557] shadow-lg">
        <CardContent className="p-6">
          {/* Grid header with decade labels */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2 mb-2">
            <div className=""></div> {/* Empty cell for top-left corner */}
            <div className="bg-[#e76f51] text-white p-2 text-center font-semibold rounded-t-md border border-[#1d3557]">
              [Decade 1 Label]
            </div>
            <div className="bg-[#e76f51] text-white p-2 text-center font-semibold rounded-t-md border border-[#1d3557]">
              [Decade 2 Label]
            </div>
            <div className="bg-[#e76f51] text-white p-2 text-center font-semibold rounded-t-md border border-[#1d3557]">
              [Decade 3 Label]
            </div>
          </div>

          {/* First row */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2 mb-2">
            <div className="bg-[#e9c46a] p-2 flex items-center justify-center font-semibold rounded-l-md border border-[#1d3557]">
              <span className="text-[#1d3557] text-center">[Row 1 Category Label]</span>
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2">
            <div className="bg-[#e9c46a] p-2 flex items-center justify-center font-semibold rounded-l-md border border-[#1d3557]">
              <span className="text-[#1d3557] text-center">[Row 2 Category Label]</span>
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
            <div className="border border-[#1d3557] bg-[#f8edeb] rounded-md p-1">
              <Input 
                placeholder="Type player..." 
                className="border-none bg-transparent focus:ring-0 h-10 text-center"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button 
          onClick={handleSubmit} 
          className="bg-[#e76f51] hover:bg-[#e76f51]/90 text-white px-8 py-2 rounded-md font-semibold text-lg"
        >
          Submit Answers
        </Button>
      </div>
    </div>
  );
};

export default GridPage;
