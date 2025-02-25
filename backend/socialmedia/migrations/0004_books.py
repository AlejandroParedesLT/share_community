from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('socialmedia', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('precordsid', models.IntegerField()),
                ('title', models.TextField(blank=True, null=True)),
                ('author', models.TextField(blank=True, null=True)),
                ('publisher', models.TextField(blank=True, null=True)),
                ('releasedate', models.DateField(blank=True, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('genre', models.CharField(max_length=100)),
            ],
        ),
    ]