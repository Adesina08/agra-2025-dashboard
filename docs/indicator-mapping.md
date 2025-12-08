# Survey Indicator to Variable Mapping

The table below captures the primary variables, choice lists, and notes for key indicators across the survey datasets. Use these references when cleaning, transforming, or validating survey submissions.

| Indicator | Best Primary Variable Name | Choice List Reference | Notes |
| --- | --- | --- | --- |
| **Avg Farm Size** | `fm6_*` | — | Area cultivated per crop — sum across crops. (**This is the farm size variable**) |
| **Top Crop** | `fm2` | `crops` list in `choices` | Crop grown in last season — use frequency or area via `fm6_*`. |
| **% Youth (in work)** | `b4` *(age)* + `b5` *(activity)* | `employment_status` list | Filter `b4` by age bracket, then check `b5`. |
| **Crops Cultivated** | `fm2` / `fm3` / `fm4` | crop lists FM block | `fm2` is most direct presence marker. |
| **Farm Size Distribution** | `fm6_total = sum(fm6_*)` | — | Derive from `fm6_*` then categorize. |
| **Farm Size vs Yield** | `fm6_*` vs `fm7_*` | — | Use matched crop index: `fm7_1 / fm6_1`, etc. |
| **Practice adoption rates** | `fm8_*` | `practice_name` list from `choices` | Checks adoption per crop & practice type. |
| **Key input use** | `h4` | `yesno` / `inputs_received` | "Did you receive any input/machinery on credit?" Most direct indicator of access. |
| **Commercialisation profile** | `e20` *(proportion sold)* | `share_value` scale | Core commercialization indicator → % harvest sold. |
| **Financial inclusion** | `h7` *(account/SACCO/mobile money access)* | `account_type` | Strongest FI visibility variable. |
| **Rainfall Perception** | `e27` | `better/same/worse` scale | Compares this year to a normal one. |
| **Rainfall Spread** | `e29` | rainfall spread choices | Captures onset, breaks, distribution. |
| **Shock Exposure** | `e31` | `shock_type` | List includes drought, pests, price, flood etc. |
| **Youth participation** | `b5` *(employment/activity)* | `employment_status` | Extract only respondents where `b4` age = youth range. |
| **Youth attitude towards agri work** | `att1` `att2` `att3` (attitudes block)** | Likert list in choices | Positive/negative perception scoring. |
| **Gender Distribution** | `b3` | `gender` | Male/Female — directly respondent-level. |
| **Region Distribution** | `d1` | `d1` list in choices | Rwanda / Tanzania / Kenya etc. from `choices` confirms list. |

## Usage notes

- The `fm6_*` series represents per-crop plot areas; summing them yields farm size totals and supports yield-per-hectare calculations when paired with `fm7_*` production values.
- Youth indicators require combining the age variable `b4` with employment status `b5` to isolate in-work youth.
- Choice list references point to option sets in the survey XLSForm; ensure labels are standardized before aggregation.
