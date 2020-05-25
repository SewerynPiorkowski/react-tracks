import React, { useState, useContext } from "react";
import { Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import axios from 'axios'
import Error from '../Shared/Error'
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import { UserContext } from '../../Root'

const UpdateTrack = ({ classes, track }) => {

  const currentUser = useContext(UserContext)
  console.log(currentUser)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(track.title)
  const [description, setDescription] = useState(track.description)
  const [file, setFile] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fileError, setFileError] = useState("")
  const isCurrentUser = currentUser.id === track.postedBy.id

  const handleAudioChange = (event) => {
    const selectedFile = event.target.files[0]
    const fileSizeLimit = 10000000 // 10MB
    if (selectedFile && selectedFile.size > fileSizeLimit) {
      setFileError(`${selectedFile.name}: File size too large`)
    } else {
      setFile(selectedFile)
      setFileError("")
    }
  }

  const handleAudioUpload = async () => {
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('resource_type', 'raw')
      data.append('upload_preset', 'qeifophq')
      data.append('cloud_name', 'dkaxgcbxt')
      const res = await axios.post('https://api.cloudinary.com/v1_1/dkaxgcbxt/raw/upload', data)
      return res.data.url
    } catch (error) {
      console.error('Error uploading file', error)
      setSubmitting(false)
    }
  }

  const handleSubmit = async (event, updateTrack) => {
    event.preventDefault()
    setSubmitting(true)

    // upload our audio files, get returned url from api
    const uploadedUrl = await handleAudioUpload()
    updateTrack({ variables: { trackId: track.id, title, description, url: uploadedUrl } })
  }

  return isCurrentUser && (
    <>
      {/* update track button  */}
      <IconButton onClick={() => setOpen(true)}>
        <EditIcon />
      </IconButton>

      {/* Update track dialog  */}
      <Mutation
        mutation={UPDATE_TRACK_MUTATION}
        onCompleted={data => {
          console.log(data);
          setSubmitting(false)
          setOpen(false)
          setTitle("")
          setDescription("")
          setFile("")
        }}x
      >
        {(updateTrack, { loading, error }) => {
          if (error) return <Error error={error} />
          return (
            <Dialog open={open} className={classes.dialog}>
              <form onSubmit={event => handleSubmit(event, updateTrack)}>
                <DialogTitle>Update track</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Add a title, description & audio file (under 10MB)
                  </DialogContentText>
                  <FormControl fullWidth>
                    <TextField
                      label="Title"
                      placeholder="add title"
                      onChange={event => setTitle(event.target.value)}
                      value={title}
                      className={classes.textField}
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      multiline
                      rows='4'
                      label="Description"
                      placeholder="add description"
                      onChange={event => setDescription(event.target.value)}
                      value={description}
                      className={classes.textField}
                    />
                  </FormControl>
                  <FormControl error={Boolean(fileError)}>
                    <input
                      id='audio'
                      required
                      type='file'
                      accept='audio/*'
                      className={classes.input}
                      onChange={handleAudioChange}
                    />
                    <label htmlFor="audio">
                      <Button
                        variant='outlined'
                        component='span'
                        className={classes.button}
                        color={file ? "secondary" : "inherit"}
                      >
                        Audio file
                  <LibraryMusicIcon className={classes.icon} />
                      </Button>
                      {file && file.name}
                      <FormHelperText>{fileError}</FormHelperText>
                    </label>
                  </FormControl>
                </DialogContent>
                <DialogActions>
                  <Button
                    className={classes.cancel}
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={classes.save}
                    type='submit'
                    disabled={
                      !title.trim() ||
                      !description.trim() ||
                      !file ||
                      submitting
                    }
                  >
                    {submitting ? (
                      <CircularProgress className={classes.save} size={24} />
                    ) : (
                        "Update track"
                      )}
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
          )
        }}
      </Mutation>
    </>
  )
};

const UPDATE_TRACK_MUTATION = gql`
  mutation($trackId: Int!, $title: String, $description: String, $url: String) {
    updateTrack(
      trackId: $trackId,
      title: $title, 
      description: $description,
      url: $url
    ) {
      track {
        id
        title
        description
        url
        likes {
          id
        }
        postedBy {
          id
          username
      }
    }
    }
  }
`

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550
  },
  textField: {
    margin: theme.spacing.unit
  },
  cancel: {
    color: "red"
  },
  save: {
    color: "green"
  },
  button: {
    margin: theme.spacing.unit * 2
  },
  icon: {
    marginLeft: theme.spacing.unit
  },
  input: {
    display: "none"
  }
});

export default withStyles(styles)(UpdateTrack);
