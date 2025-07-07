import { Any } from 'constants/types';
import { AxiosInstanceClass } from './axiosBaseQuery';
import { useState, useEffect } from 'react';
import { useAppDispatch } from 'app/store';
import { setLoading } from 'components/fullScreenSniping/fullScreenSnipingSlice';

export default function useAxiosLoader() {
  const [counter, setCounter] = useState(0);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const reqInterceptor = AxiosInstanceClass.getInstance().interceptors.request.use(
      (config: Any) => {
        const loading = config?.headers?.head?.['is-loading'];
        setCounter(i => i + (loading === '1' ? 1 : 0));
        config.headers.IsLoading = loading === '1';
        return config;
      },
      (error: Any) => {
        if (error.headers?.head?.['is-loading'] === '1') {
          setCounter(i => i - 1);
        }
        return Promise.reject(error);
      }
    );
    const resInterceptor = AxiosInstanceClass.getInstance().interceptors.response.use(
      (response: Any) => {
        setCounter(i => i - (response?.config?.headers?.IsLoading ? 1 : 0));
        return response;
      },
      (error: Any) => {
        setCounter(i => i - (error?.config?.headers?.IsLoading ? 1 : 0));
        return Promise.reject(error);
      }
    );

    return () => {
      AxiosInstanceClass.getInstance().interceptors.request.eject(reqInterceptor);
      AxiosInstanceClass.getInstance().interceptors.response.eject(resInterceptor);
    };
  }, []);

  useEffect(() => {
    // ローディングを開く
    dispatch(setLoading(counter > 0));
  }, [counter, dispatch]);

  return [counter > 0];
}
