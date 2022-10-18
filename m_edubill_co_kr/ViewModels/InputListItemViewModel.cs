using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels
{
    public class InputListItemViewModel
    {
        public String Date { get; set; }
        public String Time { get; set; }
        public String Name { get; set; }
        public String Amt { get; set; }
        public int Yeosin { get; set; }
        public int Misu { get; set; }
        public String Gubun { get; set; }
        public String AccountNo { get; set; }
       
    }
}