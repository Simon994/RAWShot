/* eslint-disable camelcase */
import React from 'react'
import { Icon, Comment, Form, Button, Loader } from 'semantic-ui-react'

import { getSinglePhoto, getUserProfile, likePhoto, unlikePhoto, createComment } from '../../lib/api'
import { isAuthenticated } from '../../lib/auth'

class PhotoShow extends React.Component {

  state = {
    singlePhotoData: null,
    formText: '',
    postBtnHidden: true,
    currentUserPhoto: null
  }

  async componentDidMount() {
    const photoId = this.props.match.params.id

    const response = await getSinglePhoto(photoId)
    const currentUserProfile = await getUserProfile()
    const currentUserId = currentUserProfile.data.id

    const likedByArrayIds = response.data.liked_by.map(likedBy => likedBy.id)
    const isLikedByCurrentUser = likedByArrayIds.includes(currentUserId)
    const heartColor = isLikedByCurrentUser ? 'pink' : 'grey'
    const currentUserPhoto = currentUserProfile.data.profile_image

    this.setState({
      singlePhotoData: response.data,
      heartColor,
      liked: isLikedByCurrentUser,
      currentUserPhoto
    })
  }

  handleClick = async () => {

    const { id } = this.props.match.params
    const { liked } = this.state

    if (!liked) {
      try {
        await likePhoto(id)
        this.setState({
          heartColor: 'pink',
          liked: true
        })
      } catch (err) {
        console.log(err)
      }
    } else {
      try {
        await unlikePhoto(id)
        this.setState({
          heartColor: 'grey',
          liked: false
        })
      } catch (err) {
        console.log(err)
      }
    }
  }

  handleTextChange = (e) => {
    const formText = e.target.value
    this.setState({
      formText
    })
  }

  handleTextBoxClick = () => {
    this.setState({
      postBtnHidden: false
    })
  }

  handleCancelClick = () => {
    this.setState({
      postBtnHidden: true
    })
  }

  handleCommentSubmit = async () => {
    const formData = {
      text: this.state.formText,
      photo: this.state.singlePhotoData.id
    }

    try {
      const resCreateComment = await createComment(formData)

      if (resCreateComment.status === 201) {
        const photoId = this.props.match.params.id
        const response = await getSinglePhoto(photoId)

        this.setState({
          singlePhotoData: response.data,
          formText: ''
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  render() {

    if (!this.state.singlePhotoData || !this.state.currentUserPhoto){
      return <Loader active inline='centered' />
    }

    const { image, title, comments, location, description, camera, categories, lens } = this.state.singlePhotoData
    const { username, profile_image } = this.state.singlePhotoData.owner
    const { heartColor, formText, postBtnHidden, currentUserPhoto } = this.state

    const uploadedAt = (this.state.singlePhotoData.uploaded_at).slice(0, 10)
    const numberOfLikes = this.state.singlePhotoData.liked_by.length

    return (
      <>
        <div className='singlephoto-container'>
          <img src={image} alt={title}/>
        </div>
        <section className='singlephoto-lower-container'>
          <div className='singlephoto-info-outer'>

            <div className='heart-btn-container'>
              <Icon
                name='heart'
                size='big'
                color={heartColor}
                onClick={this.handleClick}
                style={{ margin: '10px', cursor: 'pointer' }}
              />
            </div>

            <div className='title-owner-container'>
              <div className='singlephoto-owner-avatar'>
                <img src={profile_image} alt='profile' style={{ borderRadius: '50%', width: '50px' }} />
              </div>

              <div>
                <h2>{title}</h2>
                <p>by {username}</p>
              </div>
            </div>

            <div className='location-time'>
              <Icon name='map marker alternate' />
              <p style={{ marginRight: '15px', textDecorationLine: 'underline', textDecorationStyle: 'dashed' }}>{location}</p>
              <p><strong>Uploaded:</strong> {uploadedAt}</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <p>{description}</p>
              <br />
              <p>{numberOfLikes} {numberOfLikes === 1 ? 'person' : 'people'} liked this photo</p>
              <br />
              <div>
                <Icon name='camera' size='large' color='grey' /><span className='gear'>{camera}</span>
              </div>
              <br/>
              <Icon name='eye' size='large' color='grey' /><span className='gear'>{lens}</span>
              <h4 style={{ marginTop: '40px' }}>Categories:</h4>
              <div className='photoshow-categories-list'>
                {categories.map((category, index) => {
                  return (
                    <div key={index} className='photoshow-category'>
                      {category.name}
                    </div>
                  )
                })
                }
              </div>
            </div>

          </div>

          <div className='comments-outer-container'>
            <Comment.Group>

              {isAuthenticated() &&
                <Form >
                  <div className='form-input-container'>
                    <img src={currentUserPhoto} alt='profile' style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '5px', marginTop: '5px' }} />
                    <Form.Input
                      onClick={this.handleTextBoxClick}
                      onChange={this.handleTextChange}
                      value={formText}
                      placeholder={'💬   Add a comment'}
                    />
                  </div>
                  <div className={`comment-btns-container ${postBtnHidden ? 'hidden-btns' : 'show-btns'}`}>
                    <Button
                      className='cancel-btn'
                      onClick={this.handleCancelClick}
                    >
                      Cancel
                    </Button>
                    <Button primary
                      className='lozenge'
                      onClick={this.handleCommentSubmit}
                    >
                      Post
                    </Button>
                  </div>
                </Form>
              }

              <p style={{ marginTop: '7px' }}><strong>{comments.length} comments</strong></p>
              {!comments.length &&
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Icon name='comment outline' size='big' />
                  <br />
                  <br />
                  <p>No comments yet</p>
                </div>
              }
              {comments.map((comment, index) => {
                return (
                  <Comment key={index}>
                    <img src={comment.owner.profile_image} alt='profile' style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                      <Comment.Author>{comment.owner.username}</Comment.Author>
                      <Comment.Text>{comment.text}</Comment.Text>
                    </div>
                  </Comment>
                )
              })
              }
            </Comment.Group>
          </div>
        </section>
      </>
    )
  }

}

export default PhotoShow