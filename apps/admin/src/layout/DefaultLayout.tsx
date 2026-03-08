import { CircularProgressBar, Loader } from "@legacy-apartment/ui";
import Head from "next/head";
import React, { useState, useEffect } from "react";

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rely immediately on Loader completing to hide it
  }, []);

  return (
    <div>
      <Head>
        <title>Welcome | Legacy Apartment Admin</title>
      </Head>
      {isLoading ? (
        <Loader onComplete={() => setIsLoading(false)} />
      ) : (
        <div className="min-h-screen relative">

          <main className="">
            {children}
          </main>
        </div>
      )}
    </div>
  );
};

export default DefaultLayout;
