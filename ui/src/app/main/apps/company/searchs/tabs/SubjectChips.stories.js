import React from "react";
import { Button } from "@storybook/react/demo";
import { SubjectChips } from "./SubjectChips";
export default { title: "SubjectChips" };

export const withText = () => <SubjectChips>Hello Button</SubjectChips>;

// export const withEmoji = () => (
//     <Button>
//         <span role="img" aria-label="so cool">
//             😀 😎 👍 💯
//         </span>
//     </Button>
// );
