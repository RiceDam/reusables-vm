import {Link} from "react-router-dom";

function StartPage() {
  return (
    <div>
      <h1>Welcome to Something</h1>
      <Link to={'content'}>Click here to get started</Link>
    </div>
  )
}

export default StartPage;