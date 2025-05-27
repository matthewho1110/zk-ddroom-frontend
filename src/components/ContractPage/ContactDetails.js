const ContractDetails = ({ contract, setContract, onSubmit }) => {
    <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
            <TextField
                label="Contract ID"
                id="id"
                name="id"
                required
                fullWidth
                variant="standard"
                error={errors.id}
                helperText={errors.id}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.id}
            />
        </Grid>

        <Grid item xs={12} md={6}>
            <TextField
                label="Status"
                id="status"
                name="status"
                select
                required
                fullWidth
                variant="standard"
                error={errors.status}
                helperText={errors.status}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.status}
            >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
            <TextField
                label="Manager Email"
                id="managerEmail"
                name="managerEmail"
                required
                fullWidth
                variant="standard"
                error={errors.managerEmail}
                helperText={errors.managerEmail}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.managerEmail}
            />
        </Grid>

        <Grid item xs={12} md={6}>
            <TextField
                label="Organization"
                id="organization"
                name="organization"
                required
                fullWidth
                variant="standard"
                error={errors.organization}
                helperText={errors.organization}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.organization}
            />
        </Grid>
        <Grid
            item
            xs={12}
            md={6}
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <TextField
                label="Max Storage (GB)"
                id="maxStorage"
                name="maxStorage"
                type={"number"}
                required
                fullWidth
                variant="standard"
                endAdornment={
                    <InputAdornment position="end">GB</InputAdornment>
                }
                inputProps={{
                    step: "0.1",
                    min: 0,
                }}
                error={values.hasMaxStorage && errors.maxStorage}
                helperText={values.hasMaxStorage && errors.maxStorage}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.maxStorage}
                disabled={!values.hasMaxStorage}
            />
            <Checkbox
                name="hasMaxStorage"
                onChange={handleChange}
                checked={values.hasMaxStorage}
            />
        </Grid>

        <Grid
            item
            xs={12}
            md={6}
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <TextField
                label="Max Datarooms"
                id="maxDatarooms"
                name="maxDatarooms"
                type={"number"}
                required
                fullWidth
                variant="standard"
                inputProps={{
                    step: "1",
                    min: 0,
                }}
                error={values.hasMaxDatarooms && errors.maxDatarooms}
                helperText={values.hasMaxDatarooms && errors.maxDatarooms}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.maxDatarooms}
                disabled={!values.hasMaxDatarooms}
            />

            <Checkbox
                name="hasMaxDatarooms"
                onChange={handleChange}
                checked={values.hasMaxDatarooms}
            />
        </Grid>

        <Grid item xs={12} md={6}>
            <DatePicker
                label="Sign Date"
                disableFuture
                sx={{ width: "100%" }}
                name="signAt"
                value={values.signAt}
                onChange={(newValue) => {
                    setFieldValue("signAt", newValue);
                }}
                slotProps={{
                    textField: {
                        required: true,
                        error: errors.signAt,
                        helperText: errors.signAt,
                        onBlur: handleBlur,
                    },
                }}
            />
        </Grid>

        <Grid
            item
            xs={12}
            md={6}
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
            }}
        >
            <DatePicker
                label="Start Date"
                name="startAt"
                value={values.startAt}
                onChange={(newValue) => {
                    setFieldValue("startAt", newValue);
                }}
                slotProps={{
                    textField: {
                        required: true,
                        error: errors.startAt,
                        helperText: errors.startAt,
                        onBlur: handleBlur,
                    },
                }}
            />

            <DatePicker
                label="Expire Date"
                name="expireAt"
                value={values.expireAt}
                minDate={values.startAt}
                onChange={(newValue) => {
                    setFieldValue("expireAt", newValue);
                }}
                slotProps={{
                    textField: {
                        required: true,
                        error: errors.expireAt,
                        helperText: errors.expireAt,
                        onBlur: handleBlur,
                    },
                }}
            />
        </Grid>

        <Grid item xs={12}>
            <TextField
                label="Description"
                id="description"
                name="description"
                multiline
                rows={3}
                required
                fullWidth
                variant="outlined"
                error={errors.description}
                helperText={errors.description}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.description}
            />
        </Grid>
    </Grid>;
};
