import { Navbar, CircularProgressBar, Footer, Loader } from "@legacy-apartment/ui";
import Head from "next/head";
import React, { useState } from "react";

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div>
      <Head>
        <title>Welcome | Legacy Apartment</title>
      </Head>
      {isLoading ? (
        <Loader onComplete={() => setIsLoading(false)} />
      ) : (
        <div className="min-h-screen relative">
          <Navbar />

          <main className="">
            {children}
            <CircularProgressBar />
          </main>

          <footer>
            <Footer />
          </footer>
        </div>
      )}
    </div>
  );
};

export default DefaultLayout;
