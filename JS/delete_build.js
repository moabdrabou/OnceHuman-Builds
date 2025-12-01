document.addEventListener('DOMContentLoaded', () => {
    const buildSelect = document.getElementById('build-select');
    const deleteBuildForm = document.getElementById('delete-build-form');

    // Supabase Initialization handled in config.js


    const fetchBuilds = async () => {
        try {
            const { data: builds, error } = await supabaseClient
                .from('builds')
                .select('id, build_name');

            if (error) {
                console.error('Error fetching builds:', error);
                return;
            }

            buildSelect.innerHTML = '<option value="" disabled selected>-- Select a build to delete --</option>';

            builds.forEach(build => {
                const option = document.createElement('option');
                option.value = build.id;
                option.textContent = build.build_name;
                buildSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching builds:', error);
        }
    };

    fetchBuilds();

    deleteBuildForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const selectedBuildId = buildSelect.value;
        if (!selectedBuildId) {
            alert('Please select a build to delete.');
            return;
        }

        try {
            // 1. Delete from build_ability_assignment
            const { error: abilityError } = await supabaseClient
                .from('build_ability_assignment')
                .delete()
                .eq('build_id', selectedBuildId);
            if (abilityError) throw abilityError;

            // 2. Delete from build_cradle
            const { error: cradleError } = await supabaseClient
                .from('build_cradle')
                .delete()
                .eq('build_id', selectedBuildId);
            if (cradleError) throw cradleError;

            // 3. Delete from build_gear
            const { error: gearError } = await supabaseClient
                .from('build_gear')
                .delete()
                .eq('build_id', selectedBuildId);
            if (gearError) throw gearError;

            // 4. Finally, delete from builds
            const { error: buildError } = await supabaseClient
                .from('builds')
                .delete()
                .eq('id', selectedBuildId);
            if (buildError) throw buildError;

            alert('Build deleted successfully!');
            // Remove the deleted build from the dropdown
            buildSelect.remove(buildSelect.selectedIndex);
            // Optionally, re-fetch builds to ensure dropdown is fully updated
            fetchBuilds();
        } catch (error) {
            console.error('Error deleting build:', error);
            alert('Failed to delete build. Check console for details.');
        }
    });
});