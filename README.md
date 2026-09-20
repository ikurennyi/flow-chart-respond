# Flow Chart Application

> Created as a by Ievgenii Kurennyi
>
> This project was created as as a test in response to the request “Flow Chart App with Vue 3.”

1. [Application Notes](#title2)
2. [Where and How to View the Project](#title3)
3. [Project Launch and CLI Commands](#title4)
   1. [Launching the Project](#subtitle41)
   2. [CLI](#subtitle42)
4. [List of Used Technologies](#title5)
5. [Possible Improvements](#title6)

## <a id="title2">Application Notes</a>

1. While writing the code, it was taken into account that the final stage would be presented (i.e., some parts of the work were left in the “future tasks” list).
2. Since the task was quite large, the decision was to implement the main solution first and improve it afterward. The reason for this approach was that the whole task was essentially one feature handled by a single developer.
3. The work was split into commits to make the development process and the sequence of decisions easier to follow, in addition to the usual purpose of keeping a clear history of changes. The commits were not kept strictly atomic to speed up development.
4. At the time of writing, the next planned steps are to add GitHub Actions for running tests and deploy the application to Vercel.

## <a id="title3">Where and How to View the Project</a>

1. The project will be available:
   1. As code, [on GitHub](https://github.com/ikurennyi/flow-chart-respond).
   2. As a live version at Vercel (WIP)

## <a id="title4">Project Launch and CLI Commands</a>

> The project includes several CLI tasks. See the file `package.json`

### <a id="subtitle41">Launching the Project:</a>

1. To run the built project locally, any server (live-server, nginx) or an application with such functionality is required to bypass the browser’s restrictions on loading local resources (CORS problem).
2. If Node.js is installed:
   1. Clone/download the project from GitHub.
   2. Navigate to the project folder.
   3. Run the command `npm install`
   4. Start the application with the command `npm run dev`
   5. The Vite local server will start. Usually (if the port is available), you can go to `http://localhost:5173/` n your browser (Vite will show the address of the running server in the terminal).
3. The running application can be viewed [on the public Vercel page](...) (WIP).

### <a id="subtitle42">CLI:</a>

1. Start the project: `npm run dev`
2. Build the project: `npm run build`

## <a id="title5">List of Used Technologies</a>

- [Vue.js](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [TanStack Query (Vue)](https://tanstack.com/query/latest/docs/framework/vue/overview)
- [Vue Flow](https://vueflow.dev/)

## <a id="title6">Possible Improvements</a>

1. Add controls to flow chart
2. Improve truncated texts:
   1. Add tooltip
   2. Improve texts
3. Add Dark theme and theme switcher
4. Ask for action on node remove: delete ancestors or delete only node and connect ancestors to parent node
5. Touch devices support
6. Full keyboard navigation
7. Set focus on Title in Drawer when opened
8. Improve a11y
9. Animations/centering should be improved
10. Should we have a Description field in form? If Yes - how it has to be used?
11. Undo/Redo
12. Encapsulate logic in Composables

# NOTES:

- Description field in New Node form is text field by requirements
- Use JavaScript by the assignment requirements (not TypeScript)
- No requirements for mobile/touch devices
