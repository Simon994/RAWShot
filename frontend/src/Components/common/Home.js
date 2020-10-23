
import React from 'react'
import { Button } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

const Home = () => {

  return (
    <Button as={Link} to='/join'>Sign up</Button>
  )

}

export default Home