const html = (todos) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial=scale=1">
      <title>Todos</title>
      <style>
        body {
          background: aliceblue;
          font-family: sans-serif;
          margin: 0;
        }

        input[type="checkbox"] {
          margin-right: 8px; 
        }

        .container {
          display: flex;
          width: 100vw;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
        }

        .inner-container {
          background: white;
          border-radius: 16px;
          padding: 32px 48px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="inner-container">
          <h1>Todos</h1>
          <div>
            <input type="text" name="name"/>
            <button id="create">Create</button>
          </div>
          <div id="todos"></div>
        </div>
      </div>
    </body>

    <script>
      window.todos = ${todos}

      var updateTodos = function() {
        fetch("/", {
          method: 'PUT',
          body: JSON.stringify({ todos: window.todos })
        })
        populateTodos()
      }

      var completeTodo = function(evt) {
        var checkbox = evt.target
        var todoElement = checkbox.parentNode
        var newTodoSet = [].concat(window.todos)
        var todo = newTodoSet.find(t => t.id == todoElement.dataset.todo)
        todo.completed = !todo.completed
        window.todos = newTodoSet
        updateTodos()
      }

      var populateTodos = function() {
        var todoContainer = document.querySelector("#todos")
        todoContainer.innerHTML = null
        
        window.todos.forEach(todo => {
          var el = document.createElement("div")
          el.style = "border-top: 1px solid hsl(0 0% 85%); margin-top: 16px; padding-top: 16px;"
          el.dataset.todo = todo.id

          var name = document.createElement("span")
          name.style = todo.completed ? "text-decoration: line-through;" : ""
          name.textContent = todo.name

          var checkbox = document.createElement("input")
          checkbox.type = "checkbox"
          checkbox.checked = todo.completed ? 1 : 0
          checkbox.addEventListener('click', completeTodo)

          el.appendChild(checkbox)
          el.appendChild(name)

          todoContainer.appendChild(el)
        })
      }

      populateTodos()

      var createTodo = function() {
        var input = document.querySelector("input[name=name]")
        if (input.value.length) {
          window.todos = [].concat(todos, {
            id: window.todos.length + 1,
            name: input.value,
            completed: false
          })
          input.value = ""
          updateTodos()
        }
      }

      document.querySelector("#create").addEventListener('click', createTodo)
    </script>
  </html>
`;

const defaultData = { todos: [] };

const setCache = (key, data) => MY_FIRST_KV.put(key, data);
const getCache = (key) => MY_FIRST_KV.get(key);

async function getTodos(request) {
  const ip = request.headers.get('CF-Connecting-IP');
  const cacheKey = `data-${ip}`;
  let data;
  const cache = await getCache(cacheKey);
  if (!cache) {
    await setCache(cacheKey, JSON.stringify(defaultData));
    data = defaultData;
  } else {
    data = JSON.parse(cache);
  }
  const body = html(JSON.stringify(data.todos || []).replace(/</g, '\\u003c'));
  return new Response(body, {
    headers: { 'Content-Type': 'text/html' },
  });
}

async function updateTodos(request) {
  const body = await request.text();
  const ip = request.headers.get('CF-Connecting-IP');
  const cacheKey = `data-${ip}`;
  try {
    JSON.parse(body);
    await setCache(cacheKey, body);
    return new Response(body, { status: 200 });
  } catch (err) {
    return new Response(err, { status: 500 });
  }
}

async function handleRequest(request) {
  if (request.method === 'PUT') {
    return updateTodos(request);
  } else {
    return getTodos(request);
  }
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
