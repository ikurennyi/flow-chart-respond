const TITLE_MAX_LENGTH = 120

export const nodeFormRules = {
  title: [
    { required: true, message: 'Title is required', trigger: 'blur' },
    {
      max: TITLE_MAX_LENGTH,
      message: `Title must be at most ${TITLE_MAX_LENGTH} characters`,
      trigger: 'blur',
    },
  ],
  nodeType: [{ required: true, message: 'Select a node type', trigger: 'change' }],
}
