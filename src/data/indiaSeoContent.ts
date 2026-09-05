import type { ToolSeoContent } from '@/data/seoContent';

export const indiaToolSeoContent:Record<string,ToolSeoContent>={
  'emi-in':{
    title:'EMI Calculator India — Monthly Loan Payment & Interest',
    description:'Calculate EMI in India from loan amount, annual interest rate and tenure. See monthly EMI, total interest, total repayment and repayment assumptions.',
    intro:'Estimate the monthly instalment for a fixed-rate reducing-balance loan and see how the loan amount, interest rate and tenure affect total repayment.',
    sections:[
      {
        title:'EMI formula and what each input means',
        paragraphs:[
          'For a standard fixed-rate reducing-balance model, EMI is calculated as P × r × (1+r)^n ÷ ((1+r)^n − 1), where P is the principal, r is the monthly interest rate and n is the number of monthly instalments.',
          'Toolmera converts the annual percentage rate you enter into a monthly rate by dividing by 12 and converts the tenure in years into monthly instalments. The estimate assumes the same rate applies across the full period.'
        ],
        facts:[
          {label:'P',value:'Loan principal'},
          {label:'r',value:'Annual rate ÷ 12 ÷ 100'},
          {label:'n',value:'Tenure in months'}
        ]
      },
      {
        title:'Worked example: ₹10 lakh at 9% for 5 years',
        paragraphs:[
          'For a ₹10,00,000 loan at a 9% annual rate over 60 months, the model gives an EMI of about ₹20,758 per month.',
          'Across the full term, estimated interest is about ₹2,45,501 and estimated total repayment is about ₹12,45,501. Actual lender schedules can differ because of fees, rate resets, rounding conventions, prepayments or other terms.'
        ],
        facts:[
          {label:'Loan amount',value:'₹10,00,000'},
          {label:'Monthly EMI',value:'≈ ₹20,758'},
          {label:'Total interest',value:'≈ ₹2,45,501'},
          {label:'Total repayment',value:'≈ ₹12,45,501'}
        ]
      },
      {
        title:'Fixed-rate estimate vs. floating-rate reality',
        paragraphs:[
          'This calculator keeps the entered annual rate constant. If your actual loan has a floating rate, a benchmark reset can change the EMI, the remaining tenure or both.',
          'RBI guidance requires regulated lenders to communicate the impact of floating-rate resets on EMI-based personal loans. For an actual borrowing decision, use the lender’s Key Facts Statement and current repayment schedule rather than this estimate alone.'
        ]
      }
    ],
    faq:[
      {q:'How is EMI calculated?',a:'Toolmera uses the standard reducing-balance EMI formula with principal, monthly interest rate and number of monthly instalments.'},
      {q:'Does this calculator include processing fees or insurance?',a:'No. The EMI estimate uses only principal, interest rate and tenure. Fees, insurance, taxes and other lender-specific charges are excluded.'},
      {q:'What if my loan has a floating interest rate?',a:'The calculator uses one constant rate. A real floating-rate loan can change EMI, tenure or both when the benchmark rate resets.'},
      {q:'Is this a loan offer or eligibility decision?',a:'No. It is an informational repayment estimate and is not a lender quote, approval or financial recommendation.'}
    ],
    related:[
      {id:'home-emi-in',anchor:'estimate a home loan EMI'},
      {id:'car-emi-in',anchor:'estimate car finance repayments'},
      {id:'loan',anchor:'open the global amortization calculator'}
    ],
    sources:[
      {label:'Reserve Bank of India — Reset of Floating Interest Rate on EMI-based Personal Loans',href:'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12529'},
      {label:'Reserve Bank of India — FAQs on floating-rate EMI resets',href:'https://www.rbi.org.in/scripts/FAQView.aspx/FAQView.aspx/FAQView.aspx?Id=170'}
    ]
  },

  'home-emi-in':{
    title:'Home Loan EMI Calculator India — Payment & Amortization',
    description:'Estimate home loan EMI in India with a reducing-balance formula, total interest, repayment schedule and comparisons across rate and tenure scenarios.',
    intro:'Model a home loan using the loan amount, annual interest rate and tenure, then review monthly EMI, total interest and the principal-versus-interest repayment pattern.',
    sections:[
      {
        title:'How home loan EMI is calculated',
        paragraphs:[
          'Toolmera uses the reducing-balance EMI formula P × r × (1+r)^n ÷ ((1+r)^n − 1). The monthly interest portion is highest near the beginning because the outstanding principal is larger; the principal portion generally increases as the balance falls.',
          'The calculator assumes one constant annual rate. Real home loans can use fixed, floating or hybrid rate structures, and lender-specific fees or rate resets are not included unless explicitly stated.'
        ]
      },
      {
        title:'Worked example: ₹50 lakh at 8.5% for 20 years',
        paragraphs:[
          'A ₹50,00,000 loan at 8.5% over 20 years produces an estimated EMI of about ₹43,391 in this fixed-rate model.',
          'Estimated total repayment is about ₹1,04,13,879, including roughly ₹54,13,879 of interest. The large difference between principal and total repayment is why comparing tenure matters.'
        ],
        facts:[
          {label:'Loan amount',value:'₹50,00,000'},
          {label:'Monthly EMI',value:'≈ ₹43,391'},
          {label:'Estimated interest',value:'≈ ₹54,13,879'},
          {label:'Estimated total',value:'≈ ₹1,04,13,879'}
        ]
      },
      {
        title:'20 years vs. 30 years: lower EMI can mean much more interest',
        paragraphs:[
          'Using the same ₹50 lakh principal and 8.5% rate, extending the term from 20 to 30 years lowers the modeled EMI from roughly ₹43,391 to roughly ₹38,446.',
          'However, the modeled lifetime interest rises from about ₹54.1 lakh to about ₹88.4 lakh. A longer tenure can improve monthly affordability while materially increasing total borrowing cost.'
        ]
      },
      {
        title:'Floating rates, prepayments and lender terms',
        paragraphs:[
          'RBI rules and guidance address how regulated lenders communicate floating-rate resets and how changes can affect EMI or tenure. Home-loan terms can also differ by lender, borrower profile and product structure.',
          'Prepayments can reduce future interest because they reduce outstanding principal earlier, but this calculator’s standard scenario does not assume unscheduled prepayments. Check the lender’s current statement and applicable terms before acting.'
        ]
      }
    ],
    faq:[
      {q:'Does a longer home-loan tenure reduce EMI?',a:'Usually yes for the same principal and rate, but a longer tenure can substantially increase total interest paid.'},
      {q:'Does this calculator support floating-rate changes?',a:'The displayed base scenario uses one constant annual rate. Use separate scenarios to model a higher or lower rate.'},
      {q:'Are registration costs, insurance and processing fees included?',a:'No. The repayment model focuses on the financed principal and interest only unless the lender adds those costs to the actual loan balance.'},
      {q:'How do prepayments affect a home loan?',a:'A principal prepayment can reduce future interest and may shorten tenure or reduce EMI depending on how the lender applies it. This base calculator does not assume unscheduled prepayments.'}
    ],
    related:[
      {id:'emi-in',anchor:'compare a standard EMI scenario'},
      {id:'loan',anchor:'review a detailed amortization schedule'},
      {id:'compound',anchor:'compare compounding effects'}
    ],
    sources:[
      {label:'Reserve Bank of India — Housing Finance directions and loan terms',href:'https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12655&Mode=0'},
      {label:'Reserve Bank of India — Floating-rate EMI reset guidance',href:'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12529'}
    ]
  },

  'car-emi-in':{
    title:'Car Loan EMI Calculator India — Down Payment & Total Cost',
    description:'Estimate car loan EMI in India using vehicle price, down payment, annual interest rate and tenure. Review financed amount, EMI, interest and total repayment.',
    intro:'Estimate how a vehicle price and down payment translate into financed principal, then compare monthly EMI and total borrowing cost across interest-rate and tenure scenarios.',
    sections:[
      {
        title:'Start with the financed amount, not just the car price',
        paragraphs:[
          'For a car loan, the financed principal is the amount actually borrowed after your down payment. A larger down payment lowers the principal and therefore lowers both the EMI and the interest charged in the fixed-rate model.',
          'The exact amount financed by a lender may differ from the vehicle price because registration, insurance, accessories, taxes, processing fees or other charges can be paid upfront or included in the financed amount depending on the product.'
        ]
      },
      {
        title:'Worked example: ₹10 lakh financed at 9.5% for 5 years',
        paragraphs:[
          'For a financed amount of ₹10,00,000 at 9.5% over 60 months, the modeled EMI is about ₹21,002.',
          'Estimated total interest is about ₹2,60,112 and estimated total repayment is about ₹12,60,112, excluding fees and other vehicle ownership costs.'
        ],
        facts:[
          {label:'Financed amount',value:'₹10,00,000'},
          {label:'Monthly EMI',value:'≈ ₹21,002'},
          {label:'Total interest',value:'≈ ₹2,60,112'},
          {label:'Total repayment',value:'≈ ₹12,60,112'}
        ]
      },
      {
        title:'Compare down payment, rate and tenure separately',
        paragraphs:[
          'Changing several inputs at once can make it difficult to see what actually improved the repayment profile. Compare one factor at a time: first down payment, then rate, then tenure.',
          'A shorter tenure generally raises the monthly EMI but reduces the period over which interest accrues. A lower financed amount reduces both the monthly burden and the total interest in the model.'
        ]
      }
    ],
    faq:[
      {q:'Should I enter ex-showroom price or on-road price?',a:'Use the amount that best represents the cost being financed. If the lender finances taxes, registration or other charges, include them in the financed amount or vehicle-price scenario.'},
      {q:'Does a larger down payment reduce interest?',a:'Yes in this model, because it reduces the principal on which interest is calculated.'},
      {q:'Are processing fees included in EMI?',a:'Not automatically. Lenders may charge fees separately or finance certain charges, so compare against the lender’s Key Facts Statement.'},
      {q:'Is this calculator a car-loan quote?',a:'No. It is an informational fixed-rate estimate, not a lender offer or approval.'}
    ],
    related:[
      {id:'emi-in',anchor:'compare a standard EMI calculation'},
      {id:'home-emi-in',anchor:'compare a longer home-loan tenure'},
      {id:'percentage',anchor:'calculate a down-payment percentage'}
    ],
    sources:[
      {label:'Reserve Bank of India — Key lending and EMI reset framework',href:'https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12827'},
      {label:'Reserve Bank of India — FAQs on EMI-based floating-rate resets',href:'https://www.rbi.org.in/scripts/FAQView.aspx/FAQView.aspx/FAQView.aspx?Id=170'}
    ]
  },

  'sip-in':{
    title:'SIP Calculator India — Estimate Mutual Fund SIP Growth',
    description:'Estimate SIP future value from monthly contribution, expected annual return and investment duration. See invested amount, estimated gains and projected value.',
    intro:'Model a regular monthly SIP contribution using an assumed annual return, then separate the amount invested from the projected gain and future value.',
    sections:[
      {
        title:'What a SIP is — and what this calculator assumes',
        paragraphs:[
          'SEBI investor education describes a Systematic Investment Plan as investing a fixed amount regularly in a mutual fund scheme. Toolmera models one monthly contribution amount repeated for the full selected period.',
          'The calculator converts the expected annual return into a monthly rate and assumes regular compounding. The return is an input assumption, not a forecast or guarantee from Toolmera, SEBI or any mutual fund.'
        ]
      },
      {
        title:'Worked example: ₹10,000 monthly for 10 years at 12%',
        paragraphs:[
          'A monthly contribution of ₹10,000 for 120 months means ₹12,00,000 is invested in total.',
          'Using a constant 12% annual return assumption and the calculator’s beginning-of-period contribution convention, the projected future value is about ₹23,23,391, including about ₹11,23,391 of modeled growth.'
        ],
        facts:[
          {label:'Monthly SIP',value:'₹10,000'},
          {label:'Invested amount',value:'₹12,00,000'},
          {label:'Estimated growth',value:'≈ ₹11,23,391'},
          {label:'Projected value',value:'≈ ₹23,23,391'}
        ]
      },
      {
        title:'Expected return is not guaranteed return',
        paragraphs:[
          'Mutual fund values fluctuate and actual returns are path-dependent. A smooth annual percentage is useful for scenario planning but it does not represent how a real scheme will move month by month.',
          'SEBI requires risk disclosure for mutual funds and investor education materials emphasize that mutual fund investments carry risk. Use the calculator to compare assumptions, not to predict a specific outcome.'
        ]
      }
    ],
    faq:[
      {q:'Is the expected SIP return guaranteed?',a:'No. The annual return is only a scenario input. Actual mutual fund returns vary and can be negative over some periods.'},
      {q:'What does invested amount mean?',a:'It is the monthly contribution multiplied by the number of monthly instalments in the selected period.'},
      {q:'Does this include taxes, expense ratios or exit loads?',a:'No. The current projection is a simplified gross-return scenario and does not model scheme expenses, taxes or transaction-specific charges.'},
      {q:'Can I use this to choose a mutual fund?',a:'No. The calculator compares mathematical scenarios and does not evaluate scheme suitability, risk profile or investment recommendations.'}
    ],
    related:[
      {id:'cagr',anchor:'calculate annualized historical growth'},
      {id:'roi',anchor:'measure total return on an investment'},
      {id:'fd-in',anchor:'compare a fixed-deposit scenario'}
    ],
    sources:[
      {label:'SEBI Investor — Financial Education Booklet',href:'https://investor.sebi.gov.in/pdf/downloadable-documents/Financial%20Education%20Booklet%20-%20English.pdf'},
      {label:'SEBI Investor — Understanding Mutual Funds',href:'https://investor.sebi.gov.in/understanding_mf.html'}
    ]
  },

  'fd-in':{
    title:'FD Calculator India — Fixed Deposit Maturity & Interest',
    description:'Estimate fixed-deposit maturity value and interest earned in India with selectable compounding frequency and a transparent compound-interest formula.',
    intro:'Estimate how a fixed deposit can grow from principal, contracted annual interest rate, tenure and compounding frequency, then compare maturity value and interest earned.',
    sections:[
      {
        title:'How fixed-deposit compounding is modeled',
        paragraphs:[
          'For a reinvestment-style deposit, interest is added back to the balance as it becomes due and can earn interest in later periods. Toolmera models this with A = P × (1 + r/m)^(m×t), where m is the selected number of compounding periods per year.',
          'Actual bank deposit products can use specific day-count, rounding, payout and premature-withdrawal rules. Always compare the estimate with the bank’s product terms.'
        ],
        facts:[
          {label:'P',value:'Deposit principal'},
          {label:'r',value:'Annual contracted rate'},
          {label:'m',value:'Compounding periods per year'},
          {label:'t',value:'Term in years'}
        ]
      },
      {
        title:'Example: ₹1 lakh at 7% for 3 years',
        paragraphs:[
          'With annual compounding, ₹1,00,000 at 7% for three years grows to about ₹1,22,504 in the model.',
          'With quarterly compounding at the same nominal annual rate and term, the modeled maturity is about ₹1,23,144. The difference illustrates why compounding frequency matters when product terms reinvest interest.'
        ],
        facts:[
          {label:'Annual compounding',value:'≈ ₹1,22,504'},
          {label:'Quarterly compounding',value:'≈ ₹1,23,144'}
        ]
      },
      {
        title:'Contracted rate and deposit terms come from the bank',
        paragraphs:[
          'RBI deposit directions define and regulate deposit interest practices, but individual banks set offered rates within the applicable framework. The rate you enter should come from the bank’s current deposit product.',
          'The calculator does not determine eligibility for additional rates, tax treatment or premature-withdrawal adjustments.'
        ]
      }
    ],
    faq:[
      {q:'What compounding frequency should I choose?',a:'Use the frequency stated by the deposit product. Different payout or reinvestment products can use different conventions.'},
      {q:'Does this include TDS or income tax?',a:'No. The calculator shows a gross mathematical maturity estimate and does not calculate individual tax liability or withholding.'},
      {q:'What is a reinvestment deposit?',a:'RBI describes reinvestment deposits as deposits where interest due is reinvested at the same contracted rate until maturity and withdrawn with principal at maturity.'},
      {q:'Does premature withdrawal change the result?',a:'It can. Banks may apply product-specific rules or rates for early withdrawal, which are not modeled here.'}
    ],
    related:[
      {id:'compound',anchor:'compare general compound-interest scenarios'},
      {id:'simple-interest',anchor:'compare non-compounding interest'},
      {id:'sip-in',anchor:'compare a market-linked SIP scenario'}
    ],
    sources:[
      {label:'Reserve Bank of India — FAQs on Interest Rate on Deposits Directions, 2025',href:'https://www.rbi.org.in/commonman/Upload/English/FAQs/PDFs/FAQIRD01042025.pdf'}
    ]
  },

  'gst-in':{
    title:'GST Calculator India — Add or Remove GST',
    description:'Calculate GST-inclusive and GST-exclusive amounts in India. Add GST to a base price or remove GST from a tax-inclusive total with common rate presets.',
    intro:'Calculate GST in either direction: add tax to a base amount or reverse a GST-inclusive amount into its base value and GST component.',
    sections:[
      {
        title:'Add GST to a base amount',
        paragraphs:[
          'To add GST, multiply the base amount by the selected GST rate and divide by 100. The GST-inclusive total is the base amount plus that tax.',
          'For example, on a base amount of ₹1,000 at 18%, GST is ₹180 and the total is ₹1,180.'
        ],
        facts:[
          {label:'GST amount',value:'Base × rate ÷ 100'},
          {label:'Final amount',value:'Base + GST'}
        ]
      },
      {
        title:'Remove GST from an inclusive amount',
        paragraphs:[
          'To reverse an inclusive price, divide the GST-inclusive amount by 1 + rate/100. The difference between the inclusive total and that base amount is the GST component.',
          'For an inclusive total of ₹1,180 at 18%, the base value is ₹1,000 and the GST component is ₹180.'
        ],
        facts:[
          {label:'Base amount',value:'Inclusive total ÷ (1 + rate/100)'},
          {label:'GST component',value:'Inclusive total − base amount'}
        ]
      },
      {
        title:'Use the correct classification and current rate',
        paragraphs:[
          'India does not have one universal GST rate for every supply. CBIC publishes rate schedules and FAQs, and the applicable rate depends on the classification and nature of the goods or services.',
          'Toolmera provides common 5%, 12%, 18% and 28% presets for convenience, but those buttons do not determine the legally applicable rate for a specific transaction. Verify the current official classification when accuracy matters.'
        ]
      }
    ],
    faq:[
      {q:'How do I add GST to a price?',a:'Multiply the base price by the GST percentage to get the tax amount, then add that tax to the base price.'},
      {q:'How do I remove GST from an inclusive price?',a:'Divide the inclusive total by 1 + GST rate/100 to recover the base amount, then subtract the base from the inclusive total to get the GST component.'},
      {q:'Are 5%, 12%, 18% and 28% the only GST rates?',a:'No. They are common headline slabs, but exemptions and other rates can apply depending on classification. Check current CBIC/GST Council information for the actual supply.'},
      {q:'Does this calculator determine my GST liability or filing position?',a:'No. It performs arithmetic only and does not determine classification, place of supply, input tax credit, filing obligations or legal tax treatment.'}
    ],
    related:[
      {id:'percentage',anchor:'calculate percentages directly'},
      {id:'discount',anchor:'calculate discounts before tax'},
      {id:'emi-in',anchor:'open India finance calculators'}
    ],
    sources:[
      {label:'CBIC — GST Goods and Services Rates',href:'https://cbic-gst.gov.in/gst-goods-services-rates.html'},
      {label:'CBIC — GST Rates FAQs',href:'https://cbic-gst.gov.in/gst-rates-faq.html'}
    ]
  }
};
