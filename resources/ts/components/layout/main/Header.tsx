// import { useState, useEffect } from 'react';
import { Layout } from 'antd';
// import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// en-GB | id-ID
// const parseDate = (date: any) => new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

export function Header({
  data,
  logoHeight,
  minHeight = '23vh',
}: any){
  // const navigate = useNavigate();
  // const [dateNow, setDateNow] = useState<any>(new Date());

  // useEffect(() => {
  //   const interval = setInterval(() => setDateNow(new Date()), 1e3);
  //   return () => clearInterval(interval);
  // }, []);

  const renderInfo = () => {
    let datas = data?.data;
    if(data?.success && datas){
      const { start_datetime, end_datetime, meal_period } = datas;
      const startDate = start_datetime ? dayjs(start_datetime) : !1;
      return (
        <div className="text-right ml-auto">
          {startDate && (
            <b className="text-3xl">
              {/* {parseDate(new Date(start_datetime))} */}
              {startDate.format('DD MMMM YYYY')}
            </b>
          )}
          
          {meal_period && (
            <div className="text-4xl text-sky-1 font-bold my-px">
              {meal_period} Time
            </div>
          )}

          {startDate && end_datetime && (
            <div className="text-2xl">
              {startDate.format('HH.mm')} - {dayjs(end_datetime).format('HH.mm')}
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <Layout.Header
      className="bg-nav text-white leading-4 h-auto flex flex-row flex-wrap items-center py-2 px-6 rounded-lg"
      style={{
        minHeight
      }}
    >
      <a
        // onClick={() => navigate('/')}
        href="/"
      >
        <img
          src="/media/img/logo/logo_text.png"
          alt="Bukit Asam"
          draggable={false}
          height={logoHeight}
          className="max-w-full"
        />
      </a>

      {renderInfo()}
    </Layout.Header>
  )
}
