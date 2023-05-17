const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllnotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean()
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes Found' })
    }

    //Add username to each note before sending the response
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))
    res.json(notesWithUser)
})

// @desc Create new Note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    //confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    //check for duplicate
    const duplicate = await User.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    //Create and store new note
    const note = await Note.create({ user, title, text })

    if (note) {//created
        res.status(201).json({ message: `New note created` })
    } else {
        res.status(400).json({ message: 'Invalid note data received' })
    }

})

// @desc Update a note
// @route Patch /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    //confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    //confirm note exist
    const note = await note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'note not found' })
    }

    //check for duplicate
    const duplicate = await note.findOne({ title }).lean().exec()
    //Allow updates to the original note
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate notename' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatenote = await note.save()

    res.json({ message: `${updatenote.title} updated` })
})

// @desc  Delete a notes
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    const note = await Note.findOne({ user: id }).lean().exec()
    if (!note) {
        return res.status(400).json({ messge: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note ${result.titlw} with ID ${result._id} deleted`
    res.json(reply)
})

module.exports = {
    getAllnotes,
    createNewNote,
    updateNote,
    deleteNote
}