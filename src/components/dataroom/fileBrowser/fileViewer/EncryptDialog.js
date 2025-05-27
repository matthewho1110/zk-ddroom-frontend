const EncryptDialog = ({ open, onClose, onSubmit }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Encrypt</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Enter a password to encrypt the file.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="password"
                    label="Password"
                    type="password"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>

                <Button onClick={onSubmit} color="primary">
                    Encrypt
                </Button>
            </DialogActions>
        </Dialog>
    );
};
