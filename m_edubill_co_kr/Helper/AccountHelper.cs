using m_edubill_co_kr.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.Helper
{
    public class AccountHelper
    {
        public static String MakeSession(String LoginId, String Password)
        {
            DataProxy mDataProxy = new DataProxy();
            String Session = "";

            try
            {
                Session = mDataProxy.MakeSession(LoginId, Password);
            }
            catch
            {
            }

            return Session;
        }

        public static bool IsAuthenticated(HttpRequestBase Request)
        {
            DataProxy mDataProxy = new DataProxy();
            bool r = false;
            try
            {
                var Session = Request.Cookies["Session"].Value;
                r = mDataProxy.HasSession(Session);
            }
            catch
            {

            }
            return r;
        }

        public static int GetbIdxSub(HttpRequestBase Request)
        {
            DataProxy mDataProxy = new DataProxy();
            int r = 0;
            try
            {
                var Session = Request.Cookies["Session"].Value;
                r = mDataProxy.GetbIdxSub(Session);
            }
            catch
            {

            }
            return r;
        }

        public static int GetIdx(HttpRequestBase Request)
        {
            DataProxy mDataProxy = new DataProxy();
            int r = 0;
            try
            {
                var Session = Request.Cookies["Session"].Value;
                r = mDataProxy.GetIdx(Session);
            }
            catch
            {

            }
            return r;
        }

        public static string GetCompanyName(HttpRequestBase Request)
        {
            DataProxy mDataProxy = new DataProxy();
            string r = "";
            try
            {
                var Session = Request.Cookies["Session"].Value;
                r = mDataProxy.GetCompanyName(Session);
            }
            catch
            {

            }
            return r;
        }

        public static string GetCompanyCode(HttpRequestBase Request)
        {
            DataProxy mDataProxy = new DataProxy();
            string r = "";
            try
            {
                var Session = Request.Cookies["Session"].Value;
                r = mDataProxy.GetCompanyCode(Session);
            }
            catch
            {

            }
            return r;
        }


        public static string GetUserCode(HttpRequestBase Request)
        {
            DataProxy mDataProxy = new DataProxy();
            string r = "";
            try
            {
                var Session = Request.Cookies["Session"].Value;
                r = mDataProxy.GetUserCode(Session);
            }
            catch
            {

            }
            return r;
        }

        public static string[] GetBrand(HttpRequestBase Request)
        {
            DataProxy mDataProxy = new DataProxy();
            string[] r = new string[0];
            try
            {
                var Session = Request.Cookies["Session"].Value;
                r = mDataProxy.GetBrand(Session);
            }
            catch
            {

            }
            return r;
        }

        public static int GetMisu(HttpRequestBase Request)
        {
            DataProxy mDataProxy = new DataProxy();
            int r = 0;
            try
            {
                var Session = Request.Cookies["Session"].Value;
                r = mDataProxy.GetMisu(Session);
            }
            catch
            {

            }
            return r;
        }

        public static int GetYeosin(HttpRequestBase Request)
        {
            DataProxy mDataProxy = new DataProxy();
            int r = 0;
            try
            {
                var Session = Request.Cookies["Session"].Value;
                r = mDataProxy.GetYeosin(Session);
            }
            catch
            {

            }
            return r;
        }
    }
}