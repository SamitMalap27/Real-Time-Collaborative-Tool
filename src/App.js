import './App.css';
import './chat.css';
import './lightDarkMode.css';
import './hide.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import EditorPage from './pages/editorPage';
import { Toaster } from 'react-hot-toast';
import React from 'react';



function App() {
  return (
    <>
      <div>
        <Toaster
          containerStyle={{
            top: 20,
          }}
          toastOptions={{
            success: {
              iconTheme: {
                primary: '#ACFADF',
                secondary: 'green',
              },
            },
            style: {
              background: '#fff',
              padding: '15px',
              color: '#02011e',
            }

          }}
        ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/editor/:roomId' element={<EditorPage />}></Route>
        </Routes>
      </BrowserRouter>

    </>
  );
}

export default App;
